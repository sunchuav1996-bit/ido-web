import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { AWS_CONFIG } from '../utilities/awsConfig';

const client = new DynamoDBClient({
    region: AWS_CONFIG.region,
    credentials: {
        accessKeyId: AWS_CONFIG.credentials.accessKeyId,
        secretAccessKey: AWS_CONFIG.credentials.secretAccessKey
    }
});

const docClient = DynamoDBDocumentClient.from(client);

export const DYNAMODB_CONFIG = {
    tableName: process.env.REACT_APP_DYNAMODB_TABLE_NAME || 'ido-orders',
};

export interface OrderDetails {
    fullName: string;
    email: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface StoredOrder extends OrderDetails {
    orderId: string;
    photoS3Key: string;
    photoS3Url: string;
    createdAt: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

/**
 * Save order details and link to uploaded photo
 * @param orderDetails - User's order and shipping information
 * @param photoS3Key - S3 key of the uploaded photo
 * @param photoS3Url - S3 URL of the uploaded photo
 * @returns Promise with order ID and success status
 */
export const saveOrderToDatabase = async (
    orderDetails: OrderDetails,
    photoS3Key: string,
    photoS3Url: string
): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    try {
        // Validate credentials
        if (!AWS_CONFIG.credentials.accessKeyId || !AWS_CONFIG.credentials.secretAccessKey) {
            return {
                success: false,
                error: 'AWS credentials not configured'
            };
        }

        // Generate unique order ID
        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const timestamp = new Date().toISOString();

        // Create order object with all details linked to photo
        const order: StoredOrder = {
            orderId,
            ...orderDetails,
            photoS3Key,
            photoS3Url,
            createdAt: timestamp,
            status: 'pending'
        };

        // Save to DynamoDB
        const command = new PutCommand({
            TableName: DYNAMODB_CONFIG.tableName,
            Item: order
        });

        await docClient.send(command);

        return {
            success: true,
            orderId
        };
    } catch (error) {
        console.error('DynamoDB Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to save order details'
        };
    }
};

/**
 * Get order details by order ID
 * @param orderId - The order ID to retrieve
 * @returns Promise with order details
 */
export const getOrderById = async (
    orderId: string
): Promise<{ success: boolean; order?: StoredOrder; error?: string }> => {
    try {
        const command = new QueryCommand({
            TableName: DYNAMODB_CONFIG.tableName,
            KeyConditionExpression: 'orderId = :id',
            ExpressionAttributeValues: {
                ':id': orderId
            }
        });

        const result = await docClient.send(command);

        if (result.Items && result.Items.length > 0) {
            return {
                success: true,
                order: result.Items[0] as StoredOrder
            };
        }

        return {
            success: false,
            error: 'Order not found'
        };
    } catch (error) {
        console.error('DynamoDB Query Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to retrieve order'
        };
    }
};

/**
 * Get all orders for a specific email
 * @param email - User's email address
 * @returns Promise with list of orders
 */
export const getOrdersByEmail = async (
    email: string
): Promise<{ success: boolean; orders?: StoredOrder[]; error?: string }> => {
    try {
        const command = new QueryCommand({
            TableName: DYNAMODB_CONFIG.tableName,
            IndexName: 'email-createdAt-index', // Secondary index needed in DynamoDB
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            },
            ScanIndexForward: false // Newest first
        });

        const result = await docClient.send(command);

        return {
            success: true,
            orders: (result.Items as StoredOrder[]) || []
        };
    } catch (error) {
        console.error('DynamoDB Query Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to retrieve orders'
        };
    }
};
