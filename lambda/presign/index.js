// Lambda: presign
// POST /presign
// Body: { fileName, fileType }
// Returns presigned URL with strict restrictions

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET = process.env.S3_BUCKET_NAME;
const FOLDER_PATH = process.env.S3_FOLDER_PATH || 'user-photos/';

// Validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILENAME_LENGTH = 255;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const PRESIGN_EXPIRY = 5 * 60; // 5 minutes

const s3 = new S3Client({ region: REGION });

function validateFileRequest(fileName, fileType) {
    if (!fileName || typeof fileName !== 'string') {
        return 'fileName is required and must be a string';
    }

    if (!fileType || typeof fileType !== 'string') {
        return 'fileType is required and must be a string';
    }

    // Check filename length
    if (fileName.length > MAX_FILENAME_LENGTH) {
        return `fileName must be ≤ ${MAX_FILENAME_LENGTH} characters`;
    }

    // Check for path traversal attempts
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
        return 'Invalid fileName: path traversal detected';
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
        return `Invalid fileType. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`;
    }

    return null; // No errors
}

export const handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    try {
        // Handle different API Gateway formats
        let body = {};

        // Check if data is directly in event (HTTP API format)
        if (event.fileName && event.fileType) {
            body = event;
        }
        // Check if data is in event.body (REST API format)
        else if (event.body) {
            const bodyString = event.isBase64Encoded
                ? Buffer.from(event.body, 'base64').toString('utf-8')
                : event.body;
            body = typeof bodyString === 'string' ? JSON.parse(bodyString) : bodyString;
        }

        const { fileName, fileType } = body;

        // Validate request
        const validationError = validateFileRequest(fileName, fileType);
        if (validationError) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: validationError })
            };
        }

        // Generate S3 key with timestamp (prevents overwrites)
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const key = `${FOLDER_PATH}${timestamp}-${sanitizedFileName}`;

        // Create presigned URL with strict constraints
        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: fileType,
            Metadata: {
                'upload-time': new Date().toISOString()
            }
        });

        // Generate presigned URL with short expiry
        const signedUrl = await getSignedUrl(s3, command, {
            expiresIn: PRESIGN_EXPIRY // 5 minutes
        });

        const fileUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                url: signedUrl,
                key,
                fileUrl,
                maxFileSize: MAX_FILE_SIZE,
                expiresIn: PRESIGN_EXPIRY
            })
        };
    } catch (err) {
        console.error('Presign error:', err.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Failed to generate upload URL' })
        };
    }
};
