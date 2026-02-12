import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1'
});

const docClient = DynamoDBDocumentClient.from(client);

interface ContactMessageEvent {
    name: string;
    email: string;
    phone: string;
    message: string;
}

export const handler = async (event: ContactMessageEvent) => {
    try {
        const { name, email, phone, message } = event;

        // Validate input
        if (!name || !email || !phone || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    error: 'Missing required fields'
                })
            };
        }

        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const createdAt = new Date().toISOString();
        const tableName = process.env.CONTACT_MESSAGES_TABLE || 'ido-contact-messages';

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

        await docClient.send(command);

        // Optional: Send notification email to admin
        // You can add SNS or SES integration here later

        return {
            statusCode: 200,
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
            body: JSON.stringify({
                success: false,
                error: 'Failed to save message. Please try again later.'
            })
        };
    }
};
