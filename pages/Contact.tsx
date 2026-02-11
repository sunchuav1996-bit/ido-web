import React, { useState, ChangeEvent, FormEvent, FocusEvent, useMemo } from 'react';
import { Mail, MapPin, Send, MessageSquare, CheckCircle2, AlertCircle, Instagram } from 'lucide-react';
import { Button } from '../components/Button';

interface ContactForm {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactForm, boolean>>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const validateField = (name: keyof ContactForm, value: string): string => {
    if (!value.trim()) return 'This field is required';

    if (name === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (name === 'phone') {
      const phoneDigits = value.replace(/\D/g, '');
      if (phoneDigits.length < 10) return 'Phone number must be at least 10 digits';
    }

    return '';
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name as keyof ContactForm, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Live validation if touched
    if (touched[name as keyof ContactForm]) {
      const error = validateField(name as keyof ContactForm, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const isFormValid = useMemo(() => {
    const fields: (keyof ContactForm)[] = ['name', 'phone', 'email', 'message'];
    // Check if all fields have values and no errors
    const allFilled = fields.every(field => formData[field].trim() !== '');
    const noErrors = fields.every(field => !validateField(field, formData[field]));
    return allFilled && noErrors;
  }, [formData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);

    // Simulate API call to database
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
      setTouched({});
      setErrors({});

      // Reset success message after 5 seconds
      setTimeout(() => setIsSent(false), 5000);
    }, 1500);
  };

  const getInputClassName = (name: keyof ContactForm) => {
    const hasError = touched[name] && errors[name];
    return `w-full p-4 bg-gray-50 border rounded-lg outline-none transition-all ${hasError
        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/50'
        : 'border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue'
      }`;
  };

  return (
    <div className="pb-20 pt-8">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-brand-dark mb-4">Get in Touch</h2>
        <p className="text-brand-lightText text-lg">
          Have questions about your custom 3D statue? We're here to help you turn your memories into art.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

        {/* Left Column - Contact Info */}
        <div className="space-y-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-brand-dark mb-8">Contact Information</h3>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-blue/10 rounded-full shrink-0">
                    <MapPin className="w-6 h-6 text-brand-blue" />
                  </div>
                  <div>
                    <h4 className="font-medium text-brand-dark text-lg">Our Studio</h4>
                    <p className="text-brand-lightText mt-1 leading-relaxed">
                      98, Kota Nagar, Vidi Gharkul,<br />
                      Hyd Road, Solapur 413006
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-blue/10 rounded-full shrink-0">
                    <Mail className="w-6 h-6 text-brand-blue" />
                  </div>
                  <div>
                    <h4 className="font-medium text-brand-dark text-lg">Email Us</h4>
                    <p className="text-brand-lightText mt-1">
                      care@idoforyou.in
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100">
              <h4 className="font-medium text-brand-dark mb-4">Follow us on Instagram</h4>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-brand-lightText hover:text-white hover:bg-gradient-to-tr hover:from-[#fdf497] hover:via-[#fd5949] hover:to-[#d6249f] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
                  title="Follow us on Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div>
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-card border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className="text-brand-blue w-6 h-6" />
              <h3 className="text-2xl font-semibold text-brand-dark">Send a Message</h3>
            </div>

            {isSent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h4 className="text-2xl font-bold text-brand-dark mb-3">Message Sent!</h4>
                <p className="text-brand-lightText max-w-xs mx-auto leading-relaxed">
                  Thank you for reaching out. We will review your message and get back to you shortly.
                </p>
                <button
                  onClick={() => setIsSent(false)}
                  className="mt-8 text-brand-blue hover:text-brand-blueHover font-medium flex items-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-brand-dark block mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    className={getInputClassName('name')}
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                  {touched.name && errors.name && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-2 animate-fade-in">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-brand-dark block mb-2">Phone Number <span className="text-red-500">*</span></label>
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
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-2 animate-fade-in">
                        <AlertCircle className="w-3 h-3" /> {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-brand-dark block mb-2">Email Address <span className="text-red-500">*</span></label>
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
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-2 animate-fade-in">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-brand-dark block mb-2">Message <span className="text-red-500">*</span></label>
                  <textarea
                    name="message"
                    placeholder="How can we help you?"
                    rows={4}
                    className={getInputClassName('message')}
                    value={formData.message}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    style={{ resize: 'none' }}
                  />
                  {touched.message && errors.message && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-2 animate-fade-in">
                      <AlertCircle className="w-3 h-3" /> {errors.message}
                    </p>
                  )}
                </div>

                <Button
                  fullWidth
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`flex items-center justify-center gap-2 transition-all ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={!isFormValid ? "Please fill all required fields correctly" : ""}
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};