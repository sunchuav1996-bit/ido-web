// Lambda: createOrder
// POST /create-order
// Body: { orderDetails, photoS3Key, photoS3Url }

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE = process.env.DYNAMODB_TABLE_NAME;
const BUCKET = process.env.S3_BUCKET_NAME || 'ido-web-uploads';
const FOLDER_PATH = process.env.S3_FOLDER_PATH || 'user-photos/';

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Validation constants
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 20;
const MAX_ADDRESS_LENGTH = 200;
const MAX_CITY_LENGTH = 50;
const MAX_STATE_LENGTH = 50;
const MAX_ZIP_LENGTH = 10;
const MAX_PAYLOAD_SIZE = 10 * 1024; // 10KB

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{7,}$/; // At least 7 digits
const S3_KEY_PATTERN = new RegExp(`^${FOLDER_PATH.replace(/\//g, '\\/')}`);

function validateOrderDetails(details) {
    if (typeof details !== 'object' || details === null) {
        return 'Invalid orderDetails format';
    }

    // Check for unknown fields
    const allowedFields = ['fullName', 'email', 'phone', 'streetAddress', 'city', 'state', 'zipCode'];
    const providedFields = Object.keys(details);
    const unknownFields = providedFields.filter(f => !allowedFields.includes(f));
    if (unknownFields.length > 0) {
        return `Unknown fields: ${unknownFields.join(', ')}`;
    }

    // Validate required fields
    const { fullName, email, phone, streetAddress, city, state, zipCode } = details;

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
        return 'fullName is required and must be a non-empty string';
    }
    if (fullName.length > MAX_NAME_LENGTH) {
        return `fullName must be ≤ ${MAX_NAME_LENGTH} characters`;
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
        return 'Invalid email format';
    }
    if (email.length > MAX_EMAIL_LENGTH) {
        return `email must be ≤ ${MAX_EMAIL_LENGTH} characters`;
    }

    if (!phone || typeof phone !== 'string') {
        return 'phone is required';
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        return 'phone must have at least 10 digits';
    }
    if (phone.length > MAX_PHONE_LENGTH) {
        return `phone must be ≤ ${MAX_PHONE_LENGTH} characters`;
    }

    if (!streetAddress || typeof streetAddress !== 'string' || streetAddress.trim().length === 0) {
        return 'streetAddress is required';
    }
    if (streetAddress.length > MAX_ADDRESS_LENGTH) {
        return `streetAddress must be ≤ ${MAX_ADDRESS_LENGTH} characters`;
    }

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
        return 'city is required';
    }
    if (city.length > MAX_CITY_LENGTH) {
        return `city must be ≤ ${MAX_CITY_LENGTH} characters`;
    }

    if (!state || typeof state !== 'string' || state.trim().length === 0) {
        return 'state is required';
    }
    if (state.length > MAX_STATE_LENGTH) {
        return `state must be ≤ ${MAX_STATE_LENGTH} characters`;
    }

    if (!zipCode || typeof zipCode !== 'string' || zipCode.trim().length === 0) {
        return 'zipCode is required';
    }
    if (zipCode.length > MAX_ZIP_LENGTH) {
        return `zipCode must be ≤ ${MAX_ZIP_LENGTH} characters`;
    }

    return null; // No errors
}

function validateS3Key(key) {
    if (!key || typeof key !== 'string') {
        return 'Invalid S3 key format';
    }

    // Validate key matches expected pattern
    if (!S3_KEY_PATTERN.test(key)) {
        return 'S3 key must start with expected folder path';
    }

    // Check for path traversal attempts
    if (key.includes('..') || key.includes('//')) {
        return 'Invalid S3 key: path traversal detected';
    }

    return null;
}

export const handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json'
    };

    return (async () => {
        try {
            // Validate payload size
            const rawPayload = typeof event.body === 'string' ? event.body : JSON.stringify(event.body || event);
            if (Buffer.byteLength(rawPayload, 'utf8') > MAX_PAYLOAD_SIZE) {
                return {
                    statusCode: 413,
                    headers,
                    body: JSON.stringify({ success: false, error: 'Payload too large' })
                };
            }

            // Handle different API Gateway formats
            let body = {};

            if (event.orderDetails && event.photoS3Key && event.photoS3Url) {
                body = event;
            } else if (event.body) {
                const bodyString = event.isBase64Encoded
                    ? Buffer.from(event.body, 'base64').toString('utf-8')
                    : event.body;
                body = typeof bodyString === 'string' ? JSON.parse(bodyString) : bodyString;
            }

            const { orderDetails, photoS3Key, photoS3Url } = body;

            // Validate required fields exist
            if (!orderDetails) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'orderDetails is required' })
                };
            }
            if (!photoS3Key) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'photoS3Key is required' })
                };
            }
            if (!photoS3Url) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'photoS3Url is required' })
                };
            }

            // Validate orderDetails
            const orderError = validateOrderDetails(orderDetails);
            if (orderError) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: orderError })
                };
            }

            // Validate S3 key
            const s3Error = validateS3Key(photoS3Key);
            if (s3Error) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: s3Error })
                };
            }

            // Validate S3 URL format
            if (!photoS3Url.startsWith('https://') || !photoS3Url.includes(BUCKET)) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'Invalid S3 URL' })
                };
            }

            // Force status to PENDING (never accept from client)
            const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const timestamp = new Date().toISOString();

            const item = {
                orderId,
                ...orderDetails,
                photoS3Key,
                photoS3Url,
                createdAt: timestamp,
                status: 'PENDING', // Force this server-side
                updatedAt: timestamp
            };

            const command = new PutCommand({ TableName: TABLE, Item: item });
            await docClient.send(command);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, orderId })
            };
        } catch (err) {
            console.error('Order creation error:', err.message);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ success: false, error: 'Server error' })
            };
        }
    })();
};
