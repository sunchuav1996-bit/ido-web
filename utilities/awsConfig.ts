// AWS Configuration
// Replace these with your actual AWS credentials
// IMPORTANT: Never hardcode credentials in production. Use environment variables or IAM roles.

export const AWS_CONFIG = {
    region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || ''
    }
};

export const S3_CONFIG = {
    bucketName: process.env.REACT_APP_S3_BUCKET_NAME || 'ido-web-uploads',
    folderPath: 'user-photos/' // Path within bucket where files will be stored
};

// Validate AWS configuration
export const validateAWSConfig = (): boolean => {
    // Only warn in a server (Node) environment. The frontend should not contain secrets.
    const isNode = typeof window === 'undefined';
    if (!AWS_CONFIG.credentials.accessKeyId || !AWS_CONFIG.credentials.secretAccessKey) {
        if (isNode) {
            console.warn('AWS credentials are not configured. Please set environment variables on the server.');
        }
        return false;
    }
    return true;
};
