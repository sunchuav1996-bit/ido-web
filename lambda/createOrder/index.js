// Lambda: createOrder
// POST /create-order
// Body: { orderDetails, photoS3Key, photoS3Url }

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE = process.env.DYNAMODB_TABLE_NAME;

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    try {
        const body = JSON.parse(event.body || '{}');
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
