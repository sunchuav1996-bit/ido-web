import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { AWS_CONFIG, S3_CONFIG } from '../utilities/awsConfig';

// Initialize S3 client
const s3Client = new S3Client({
    region: AWS_CONFIG.region,
    credentials: {
        accessKeyId: AWS_CONFIG.credentials.accessKeyId,
        secretAccessKey: AWS_CONFIG.credentials.secretAccessKey
    }
});

export interface UploadResponse {
    success: boolean;
    fileUrl?: string;
    key?: string;
    error?: string;
}

/**
 * Upload a file to AWS S3
 * @param file - The file object to upload
 * @param fileName - Custom name for the file (optional, uses original name if not provided)
 * @returns Promise with upload response
 */
export const uploadFileToS3 = async (
    file: File,
    fileName?: string
): Promise<UploadResponse> => {
    try {
        // Validate credentials before attempting upload
        if (!AWS_CONFIG.credentials.accessKeyId || !AWS_CONFIG.credentials.secretAccessKey) {
            return {
                success: false,
                error: 'AWS credentials not configured. Please set environment variables.'
            };
        }

        // Generate unique file key with timestamp
        const timestamp = Date.now();
        const sanitizedFileName = fileName || file.name;
        const fileExtension = sanitizedFileName.split('.').pop();
        const fileKey = `${S3_CONFIG.folderPath}${timestamp}-${sanitizedFileName}`;

        // Read file as buffer
        const fileBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(fileBuffer);

        // Create S3 upload command
        const command = new PutObjectCommand({
            Bucket: S3_CONFIG.bucketName,
            Key: fileKey,
            Body: uint8Array,
            ContentType: file.type,
            Metadata: {
                'original-name': sanitizedFileName,
                'upload-date': new Date().toISOString()
            }
        });

        // Execute upload
        await s3Client.send(command);

        // Construct file URL
        const fileUrl = `https://${S3_CONFIG.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com/${fileKey}`;

        return {
            success: true,
            fileUrl,
            key: fileKey
        };
    } catch (error) {
        console.error('S3 Upload Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to upload file to S3'
        };
    }
};

/**
 * Validate file before upload
 * @param file - The file to validate
 * @returns Object with validation result and error message if invalid
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];

    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File size must be less than 10MB'
        };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Only JPG, PNG, and HEIC formats are supported'
        };
    }

    return { valid: true };
};
