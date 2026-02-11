// Lambda: createOrder
// POST /create-order
// Body: { orderDetails, photoS3Key, photoS3Url }

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE = process.env.DYNAMODB_TABLE_NAME;

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

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
        if (event.orderDetails && event.photoS3Key && event.photoS3Url) {
            body = event;
        }
        // Check if data is in event.body (REST API format)
        else if (event.body) {
            const bodyString = event.isBase64Encoded
                ? Buffer.from(event.body, 'base64').toString('utf-8')
                : event.body;
            body = typeof bodyString === 'string' ? JSON.parse(bodyString) : bodyString;
        }

        const { orderDetails, photoS3Key, photoS3Url } = body;
        if (!orderDetails || !photoS3Key || !photoS3Url) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: 'Missing order details or photo info' })
            };
        }

        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const timestamp = new Date().toISOString();

        const item = {
            orderId,
            ...orderDetails,
            photoS3Key,
            photoS3Url,
            createdAt: timestamp,
            status: 'pending'
        };

        const command = new PutCommand({ TableName: TABLE, Item: item });
        await docClient.send(command);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, orderId })
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
