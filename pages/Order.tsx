import React, { useState, useRef, ChangeEvent, FocusEvent, useMemo } from 'react';
import { Upload, Camera, MapPin, IndianRupee, AlertCircle, Trash2, RefreshCw, Sparkles, Loader } from 'lucide-react';
import { Button } from '../components/Button';
import { OrderForm, UploadedFile } from '../types';
import { validateFile } from '../utilities/fileValidation';
import { getPresignedUrl, createOrder } from '../services/apiService';
import { validateImageWithFallback } from '../services/imageValidationService';
import { showSuccess, showError } from '../utilities/notifications';

export const Order: React.FC = () => {
  const [formData, setFormData] = useState<OrderForm>({
    fullName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof OrderForm, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof OrderForm, boolean>>>({});

  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [imageValidationErrors, setImageValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationPassed, setValidationPassed] = useState(false);

  const validateField = (name: keyof OrderForm, value: string): string => {

    if (!value.trim()) {
      switch (name) {
        case 'fullName': return 'Full Name is required';
        case 'email': return 'Email Address is required';
        case 'phone': return 'Phone Number is required';
        case 'streetAddress': return 'Address is required';
        case 'city': return 'City is required';
        case 'state': return 'State is required';
        case 'zipCode': return 'Pincode is required';
        default: return 'This field is required';
      }
    }

    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }

    if (name === 'phone') {
      const phoneDigits = value.replace(/\D/g, '');
      if (phoneDigits.length < 10) return 'Phone number must be at least 10 digits';
    }

    if (name === 'zipCode') {
      // Allow spaces, but check digit count roughly (India 6, US 5)
      const zipDigits = value.replace(/\D/g, '');
      if (zipDigits.length < 5) return 'Please enter a valid Pincode/ZIP';
    }

    return '';
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Live validation if already touched
    if (touched[name as keyof OrderForm]) {
      const error = validateField(name as keyof OrderForm, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name as keyof OrderForm, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        showError(validation.error || 'Invalid file');
        return;
      }

      // First validate the image
      setIsValidating(true);
      const reader = new FileReader();
      reader.onerror = () => {
        setIsValidating(false);
      };
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        // Create image element for validation
        const img = new Image();
        img.onload = async () => {
          try {
            // Validate image BEFORE uploading to save API calls
            const validationResult = await validateImageWithFallback(img);

            setImageValidationErrors(validationResult.errors);

            if (!validationResult.isValid) {
              showError(`Photo validation failed: ${validationResult.errors.join('. ')}`, 7000);
              setIsValidating(false);
              setValidationPassed(false);
              return;
            }

            // Image passed validation!
            setValidationPassed(true);
            setIsValidating(false);
            setIsUploading(true);
            setUploadProgress(0);

            // Get presigned URL from backend (Lambda)
            const presign = await getPresignedUrl(file.name, file.type);
            if (!presign.success || !presign.url || !presign.key) {
              showError(presign.error || 'Failed to get upload URL');
              setIsUploading(false);
              setUploadProgress(0);
              return;
            }

            try {
              // Upload file directly to S3 using XMLHttpRequest to track progress
              await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                // Track upload progress
                xhr.upload.addEventListener('progress', (event) => {
                  if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percentComplete);
                  }
                });

                // Handle completion
                xhr.addEventListener('load', () => {
                  if (xhr.status >= 200 && xhr.status < 300) {
                    setUploadProgress(100);
                    resolve();
                  } else {
                    console.error('S3 upload error response:', xhr.responseText);
                    reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
                  }
                });

                // Handle errors
                xhr.addEventListener('error', () => {
                  reject(new Error('Network error during upload'));
                });

                xhr.addEventListener('abort', () => {
                  reject(new Error('Upload was aborted'));
                });

                // Configure and send request
                xhr.open('PUT', presign.url);
                xhr.setRequestHeader('Content-Type', file.type);
                xhr.send(file);
              });

              // Construct public file URL if backend didn't return it
              const bucket = process.env.REACT_APP_S3_BUCKET_NAME;
              const region = process.env.REACT_APP_AWS_REGION;
              const fileUrl = presign.fileUrl || `https://${bucket}.s3.${region}.amazonaws.com/${presign.key}`;

              setUploadedFile({
                file,
                previewUrl: base64String,
                s3Url: fileUrl,
                s3Key: presign.key
              });

              showSuccess('Photo validated and uploaded successfully!');
            } catch (err) {
              showError(err instanceof Error ? err.message : 'Upload failed');
            } finally {
              setIsUploading(false);
              setUploadProgress(0);
            }
          } catch (error) {
            showError('Failed to validate image. Please try again.', 5000);
            setIsValidating(false);
          }
        };
        img.onerror = () => {
          showError('Failed to process image. Please try a different file.', 5000);
          setIsValidating(false);
        };
        img.src = base64String;
      };

      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setImageValidationErrors([]);
    setValidationPassed(false);
    setUploadProgress(0);
    // Reset file input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation check before submit
    const newErrors: Partial<Record<keyof OrderForm, string>> = {};
    let isValid = true;
    (Object.keys(formData) as Array<keyof OrderForm>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      fullName: true, email: true, phone: true, streetAddress: true,
      city: true, state: true, zipCode: true
    });

    if (isValid && uploadedFile && uploadedFile.s3Key && uploadedFile.s3Url) {
      submitOrder();
    }
  };

  const submitOrder = async () => {
    if (!uploadedFile?.s3Key || !uploadedFile?.s3Url) {
      showError('Photo information is missing');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save order details via backend (Lambda)
      const result = await createOrder({
        orderDetails: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          streetAddress: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        photoS3Key: uploadedFile.s3Key,
        photoS3Url: uploadedFile.s3Url
      });

      if (result.success && result.orderId) {
        showSuccess(`Order created successfully! Order ID: ${result.orderId}`);
        // Proceed to payment gateway
        setTimeout(() => {
          alert(`Order ID: ${result.orderId}\nProceeding to payment gateway (Demo)`);
          // In production, redirect to payment gateway here
          // window.location.href = `https://payment-gateway.com/pay/${result.orderId}`;
        }, 1000);
      } else {
        showError(result.error || 'Failed to create order');
      }
    } catch (error) {
      showError('An error occurred while processing your order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = useMemo(() => {
    if (!uploadedFile) return false;
    const requiredFields: (keyof OrderForm)[] = ['fullName', 'email', 'phone', 'streetAddress', 'city', 'state', 'zipCode'];
    return requiredFields.every(field => !validateField(field, formData[field]));
  }, [formData, uploadedFile]);

  const getInputClassName = (name: keyof OrderForm) => {
    const hasError = touched[name] && errors[name];
    return `w-full p-3 bg-white border rounded-lg outline-none transition-all ${hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
      : 'border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20'
      }`;
  };

  return (
    <div className="pb-20 pt-8">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-10">

          {/* Section 1: Upload */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Camera className="text-brand-blue w-6 h-6" />
              <h3 className="text-xl font-semibold text-brand-dark">Upload Your Photo <span className="text-red-500">*</span></h3>
            </div>

            <p className="text-brand-lightText mb-6 text-sm leading-relaxed">
              Choose the perfect photo for your 3D statue. We recommend a clear, well-lit shot where the face is fully visible.
            </p>

            <div
              className={`border-2 border-dashed rounded-xl p-6 sm:p-10 flex flex-col items-center justify-center text-center transition-colors relative min-h-[300px] ${uploadedFile ? 'border-brand-blue bg-blue-50/5' : 'border-gray-200 hover:border-brand-blue/50 hover:bg-gray-50 cursor-pointer'} ${isUploading || isValidating ? 'opacity-70' : ''}`}
              onClick={!uploadedFile && !isUploading && !isValidating ? triggerFileUpload : undefined}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />

              {isUploading || isValidating ? (
                <div className="flex flex-col items-center justify-center animate-fade-in w-full px-8">
                  <div className="bg-brand-blue/10 p-4 rounded-full mb-4 animate-pulse">
                    <Loader className="w-8 h-8 text-brand-blue animate-spin" />
                  </div>
                  <h4 className="text-brand-blue font-semibold mb-1">{isValidating ? 'Processing Photo...' : 'Uploading Photo...'}</h4>
                  <p className="text-xs text-brand-lightText mb-3">{isValidating ? 'Preparing your photo' : 'Uploading to S3'}</p>

                  {isUploading && (
                    <div className="w-full max-w-md">
                      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-blue to-blue-500 transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                      <p className="text-center text-sm font-medium text-brand-blue mt-2">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              ) : uploadedFile ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center animate-fade-in">
                  <div className="relative inline-block group">
                    <img
                      src={uploadedFile.previewUrl}
                      alt="Preview"
                      className="max-h-[400px] w-auto object-contain rounded-lg shadow-md bg-white"
                    />

                    {/* Remove Button - Top Right Overlay */}
                    <button
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 bg-white/90 text-gray-500 hover:text-red-500 p-2 rounded-full shadow-sm border border-gray-200 transition-all hover:scale-105"
                      title="Remove photo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Replace Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFileUpload();
                    }}
                    className="mt-6 flex items-center gap-2 text-sm font-medium text-brand-lightText hover:text-brand-blue transition-colors px-4 py-2 rounded-full hover:bg-brand-blue/5 border border-transparent hover:border-brand-blue/10"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Replace Photo
                  </button>

                  {/* Validation Status */}
                  {isValidating && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm text-brand-blue animate-pulse">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Analyzing photo quality and content...</span>
                    </div>
                  )}

                  {!isValidating && imageValidationErrors.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      {imageValidationErrors.map((error, idx) => (
                        <p key={idx} className="flex items-start gap-2 text-sm text-red-700 mb-1 last:mb-0">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{error}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {!isValidating && uploadedFile && imageValidationErrors.length === 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                      <span>✓</span>
                      <span>Photo uploaded successfully! Ready for 3D statue creation.</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-brand-blue/10 p-4 rounded-full mb-4">
                    <Upload className="w-8 h-8 text-brand-blue" />
                  </div>
                  <h4 className="text-brand-blue font-semibold mb-1">Upload Photo</h4>
                  <p className="text-xs text-brand-lightText">JPG, PNG, or HEIC. Max size: 10MB</p>
                </>
              )}
            </div>

            {!uploadedFile && (
              <div className="flex justify-center mt-4">
                <p className="text-xs text-brand-blue bg-blue-50 px-4 py-2 rounded-full font-medium inline-flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Tip: Ensure the face is clearly visible for the best result
                </p>
              </div>
            )}
          </section>

          {/* Section 2: Shipping Info */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="text-brand-blue w-6 h-6" />
              <h3 className="text-xl font-semibold text-brand-dark">Shipping Information</h3>
            </div>

            <form id="orderForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-brand-dark">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter full name"
                  className={getInputClassName('fullName')}
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {touched.fullName && errors.fullName && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.fullName}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-brand-dark">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  className={getInputClassName('email')}
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-brand-dark">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  className={getInputClassName('phone')}
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {touched.phone && errors.phone && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-brand-dark">Address Details <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="streetAddress"
                  placeholder="Street address, House No."
                  className={getInputClassName('streetAddress')}
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {touched.streetAddress && errors.streetAddress && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.streetAddress}
                  </p>
                )}
              </div>

              {/* Apartment / Suite field removed as requested */}

              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-dark">City <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  className={getInputClassName('city')}
                  value={formData.city}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {touched.city && errors.city && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.city}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-dark">State <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  className={getInputClassName('state')}
                  value={formData.state}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {touched.state && errors.state && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.state}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-brand-dark">Pincode / ZIP Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="zipCode"
                  placeholder="Pincode"
                  className={getInputClassName('zipCode')}
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                {touched.zipCode && errors.zipCode && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.zipCode}
                  </p>
                )}
              </div>

            </form>
          </section>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <IndianRupee className="text-brand-blue w-6 h-6" />
              <h3 className="text-xl font-semibold text-brand-dark">Order Summary</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-lg font-medium text-brand-dark">Final Price</h4>
                <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded">Limited Offer</span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="text-4xl font-bold text-brand-blue">₹999 <span className="text-base font-normal text-brand-lightText">INR</span></div>
                <div className="text-sm text-brand-lightText">
                  <span className="line-through text-gray-400">₹3,499</span>
                  <span className="ml-2 text-green-600 font-medium">71% OFF</span>
                </div>
              </div>

              <hr className="my-6 border-gray-100" />

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-brand-lightText">
                  <span>Custom 3D Design</span>
                  <span className="font-medium text-brand-dark">Included</span>
                </div>
                <div className="flex justify-between text-sm text-brand-lightText">
                  <span>3D Printing</span>
                  <span className="font-medium text-brand-dark">Included</span>
                </div>
                <div className="flex justify-between text-sm text-brand-lightText">
                  <span>GST (18%)</span>
                  <span className="font-medium text-brand-dark">Included</span>
                </div>
                <div className="flex justify-between text-sm text-brand-lightText">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              </div>

              <Button
                fullWidth
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className={(!isFormValid || isSubmitting) ? "opacity-70 cursor-not-allowed" : ""}
                title={!isFormValid ? "Please fill all required fields and upload a photo" : isSubmitting ? "Processing your order..." : ""}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>

              <p className="text-xs text-center text-gray-400 mt-4">
                You'll be redirected to the payment gateway
              </p>
            </div>

            <div className="mt-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-brand-blue leading-relaxed">
                <strong>Note:</strong> Our artists will manually review your photo to ensure the best possible 3D result.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};