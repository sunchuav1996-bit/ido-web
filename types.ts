export interface OrderForm {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface UploadedFile {
  file: File;
  previewUrl: string;
  s3Url?: string;
  s3Key?: string;
}

export enum Step {
  UPLOAD = 0,
  DETAILS = 1,
  PAYMENT = 2,
}