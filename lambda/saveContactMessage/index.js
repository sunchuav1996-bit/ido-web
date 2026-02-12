import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1'
});

const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event));

        // Parse the body if it comes as a string (from API Gateway)
        let data = typeof event.body === 'string' ? JSON.parse(event.body) : event;

        const { name, email, phone, message } = data;

        // Validate input
        if (!name || !email || !phone || !message) {
            console.log('Validation failed - missing fields');
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Missing required fields: name, email, phone, message'
                })
            };
        }

        // Validate message length
        const messageLength = message.trim().length;
        if (messageLength < 10) {
            console.log('Validation failed - message too short');
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Message must be at least 10 characters long'
                })
            };
        }

        if (messageLength > 1000) {
            console.log('Validation failed - message too long');
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Message cannot exceed 1000 characters'
                })
            };
        }

        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const createdAt = new Date().toISOString();
        const tableName = process.env.CONTACT_MESSAGES_TABLE || 'ido-contact-messages';

        console.log(`Saving message to table: ${tableName}`);

        // Save to DynamoDB
        const command = new PutCommand({
            TableName: tableName,
            Item: {
                messageId,
                name,
                email,
                phone,
                message,
                createdAt,
                status: 'new'
            }
        });

        const result = await docClient.send(command);
        console.log('DynamoDB save successful:', messageId);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                messageId,
                message: 'Your message has been received. We will get back to you soon!'
            })
        };
    } catch (error) {
        console.error('Error saving contact message:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.message || 'Failed to save message. Please try again later.'
            })
        };
    }
};
