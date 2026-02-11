// Client-side API service to call serverless endpoints (Lambda via API Gateway)

const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

export interface PresignRequest {
    fileName: string;
    fileType: string;
}

export interface PresignResponse {
    success: boolean;
    url?: string; // presigned URL
    key?: string; // S3 key where file will be stored
    fileUrl?: string; // public file URL (if provided by backend)
    error?: string;
}

export const getPresignedUrl = async (fileName: string, fileType: string): Promise<PresignResponse> => {
    try {
        const resp = await fetch(`${API_BASE}/presign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileName, fileType } as PresignRequest)
        });

        const data = await resp.json();

        // Handle Lambda response format (has statusCode, headers, body)
        if (data.statusCode && data.body && typeof data.body === 'string') {
            return JSON.parse(data.body) as PresignResponse;
        }

        return data as PresignResponse;
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
};

export interface CreateOrderRequest {
    orderDetails: any;
    photoS3Key: string;
    photoS3Url: string;
}

export interface CreateOrderResponse {
    success: boolean;
    orderId?: string;
    error?: string;
}

export const createOrder = async (payload: CreateOrderRequest): Promise<CreateOrderResponse> => {
    try {
        const resp = await fetch(`${API_BASE}/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await resp.json();

        // Handle Lambda response format (has statusCode, headers, body)
        if (data.statusCode && data.body && typeof data.body === 'string') {
            return JSON.parse(data.body) as CreateOrderResponse;
        }

        return data as CreateOrderResponse;
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
};
