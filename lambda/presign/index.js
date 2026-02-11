// Lambda: presign
// POST /presign
// Body: { fileName, fileType }

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET = process.env.S3_BUCKET_NAME;
const FOLDER_PATH = process.env.S3_FOLDER_PATH || 'user-photos/';

const s3 = new S3Client({ region: REGION });

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
        if (!fileName || !fileType) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Missing fileName or fileType' })
            };
        }

        const timestamp = Date.now();
        const key = `${FOLDER_PATH}${timestamp}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: fileType
        });

        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 minutes

        const fileUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, url: signedUrl, key, fileUrl })
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: err.message || 'Server error' })
        };
    }
};
