// Lambda: presign
// POST /presign
// Body: { fileName, fileType }

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET = process.env.S3_BUCKET_NAME;
const FOLDER_PATH = process.env.S3_FOLDER_PATH || 'user-photos/';

const s3 = new S3Client({ region: REGION });

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    try {
        const body = JSON.parse(event.body || '{}');
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
