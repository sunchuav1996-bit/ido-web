# Serverless Lambda Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **AWS Account** with access to create S3, DynamoDB, Lambda, and IAM roles
2. **AWS CLI** installed and configured with credentials
3. **Node.js 18+** installed
4. **Serverless Framework** installed globally

Quick setup:
```bash
# Install AWS CLI (macOS with Homebrew)
brew install awscli

# Configure AWS CLI with your credentials
aws configure
# Enter: AWS Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)

# Install Node.js (if not already installed)
# Visit https://nodejs.org/ or use: brew install node

# Install Serverless Framework
npm install -g serverless
```

Verify installation:
```bash
serverless --version
aws --version
node --version
```

---

## Step 1: Prepare AWS Resources

### Create S3 Bucket
```bash
aws s3 mb s3://ido-web-uploads --region us-east-1
```

### Create DynamoDB Table
```bash
aws dynamodb create-table \
  --table-name ido-orders \
  --attribute-definitions AttributeName=orderId,AttributeType=S \
  --key-schema AttributeName=orderId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Configure S3 CORS
Save this JSON to `cors-config.json`:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedOrigins": ["http://localhost:3001", "http://localhost:5173", "https://your-production-domain.com"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Then apply it:
```bash
aws s3api put-bucket-cors \
  --bucket ido-web-uploads \
  --cors-configuration file://cors-config.json \
  --region us-east-1
```

---

## Step 2: Configure Environment Variables

Create a `.env.serverless` file in the project root (for Serverless deploy):

```bash
# AWS Region
AWS_REGION=us-east-1

# S3
S3_BUCKET_NAME=ido-web-uploads
S3_FOLDER_PATH=user-photos/

# DynamoDB
DYNAMODB_TABLE_NAME=ido-orders
```

---

## Step 3: Deploy Lambdas with Serverless

1. Navigate to project root:
```bash
cd "/Users/anandsunchu/Documents/studio code/ido-web"
```

2. Install Serverless plugins (if not installed):
```bash
npm install --save-dev serverless-plugin-tracing
```

3. Deploy to AWS:
```bash
# Load environment variables and deploy
export $(cat .env.serverless | xargs)
serverless deploy --stage dev
```

Or in one command:
```bash
S3_BUCKET_NAME=ido-web-uploads \
S3_FOLDER_PATH=user-photos/ \
DYNAMODB_TABLE_NAME=ido-orders \
serverless deploy --stage dev
```

4. **Important**: Save the output. You'll see something like:
```
endpoints:
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/presign
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/create-order
```

The base URL is: `https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev`

---

## Step 4: Configure Frontend

Update `frontend/.env.local` with the API Gateway base URL from Step 3:

```bash
# Client-side (non-secret)
REACT_APP_AWS_REGION=us-east-1
REACT_APP_S3_BUCKET_NAME=ido-web-uploads
REACT_APP_DYNAMODB_TABLE_NAME=ido-orders
# API Gateway base URL from serverless deploy output
REACT_APP_API_BASE_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev

# Existing configs
GEMINI_API_KEY=your_key
```

Restart the dev server:
```bash
npm run dev
```

---

## How Browser Connects (Security Flow – No Credentials Exposed)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER (React App)                           │
│  - NO AWS credentials stored                                         │
│  - Calls HTTP endpoints via fetch/axios                              │
└─────────────────────────────────────────────────────────────────────┘
                ↓
        ┌──────────────────┐
        │  API Gateway     │ ← Public HTTP endpoints
        │ (CORS enabled)   │ ← No auth required (public presign/create-order)
        └─────────┬────────┘
                ↓
        ┌──────────────────┐
        │  Lambda Function │ ← Uses IAM Role (server-side)
        │  (presign)       │
        │  (create-order)  │
        └─────────┬────────┘
                ↓
        ┌──────────────────────────────────────────┐
        │  AWS Services (S3, DynamoDB)             │
        │  - Lambda assumes IAM Role               │
        │  - Role has permissions to:              │
        │    • PutObject on S3                      │
        │    • PutItem on DynamoDB                  │
        └──────────────────────────────────────────┘
```

### Detailed Request/Response Flow

**1. Browser requests presigned URL (no credentials needed)**
```javascript
// Frontend: services/apiService.ts
fetch('https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/presign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fileName: 'photo.jpg', fileType: 'image/jpeg' })
})
```

**2. Lambda presign handler runs (uses IAM role)**
```javascript
// Backend: lambda/presign/index.js
// Lambda executes with IAM role credentials (NOT exposed to browser)
// Uses AWS SDK to generate presigned URL
const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 min
return { success: true, url: signedUrl, key, fileUrl };
```

**3. Browser receives presigned URL (limited permissions, time-bound)**
```javascript
// Response: 
{
  success: true,
  url: "https://ido-web-uploads.s3.us-east-1.amazonaws.com/?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
  key: "user-photos/1707000000000-photo.jpg",
  fileUrl: "https://ido-web-uploads.s3.us-east-1.amazonaws.com/user-photos/1707000000000-photo.jpg"
}
```

**4. Browser uploads directly to S3 (using presigned URL)**
```javascript
// No credentials involved - just using the presigned URL
fetch(presignedUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/jpeg' },
  body: fileData
})
```

**5. Browser submits order (no S3/DynamoDB credentials)**
```javascript
// Just sends order details to Lambda
fetch('https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderDetails: { fullName, email, phone, ... },
    photoS3Key: 'user-photos/...',
    photoS3Url: 'https://...'
  })
})
```

**6. Lambda creates order (uses IAM role)**
```javascript
// Backend: lambda/createOrder/index.js
// Lambda executes with IAM role credentials
// Creates DynamoDB item with order details
```

---

## Key Security Points

### ✅ What's NOT exposed to browser:
- AWS credentials (Access Key ID / Secret Access Key)
- AWS account ID
- IAM role details
- DynamoDB connection strings

### ✅ What IS visible to browser (safe):
- S3 bucket name
- Region
- DynamoDB table name
- API Gateway URL
- Presigned URLs (time-limited, single-use)

### ✅ Credentials used:
- **Lambda functions**: IAM Role attached to the Lambda (server-side only)
- **S3 uploads**: Presigned URL (time-limited, no credentials needed)
- **Browser**: No credentials at all

### ✅ API Gateway security:
- CORS enabled for frontend origins
- No API key required (presign/create-order are public by design)
- Optional: Add API key or Cognito authenticators if you want to restrict access

---

## Testing the Flow

1. Open frontend at `http://localhost:3001/#/order`
2. Click "Upload Photo" → Browser calls `POST /presign` endpoint
3. Verify presigned URL received in browser DevTools (F12 → Network tab)
4. Upload succeeds and preview shows
5. Fill order details and click "Proceed to Payment"
6. Check CloudWatch logs (optional) to see Lambda execution:

```bash
serverless logs -f presign --stage dev
serverless logs -f createOrder --stage dev
```

---

## Deployment Management

### View deployed functions:
```bash
serverless info --stage dev
```

### Update code and redeploy:
```bash
serverless deploy --stage dev
```

### Remove all resources:
```bash
serverless remove --stage dev
```

### View logs:
```bash
serverless logs -f presign -t --stage dev
serverless logs -f createOrder -t --stage dev
```

---

## Troubleshooting

### "No credentials found" during deploy
```bash
aws configure
# Enter your AWS Access Key ID and Secret Access Key
```

### "Access Denied" on S3 or DynamoDB
- Check IAM role attached to Lambda has correct permissions
- Verify resource ARNs in `serverless.yml`

### Lambda returns 404
- Verify API Gateway endpoints are created
- Check Serverless deployment output
- Ensure `REACT_APP_API_BASE_URL` matches the endpoint

### CORS errors in browser
- Verify S3 CORS and API Gateway CORS are configured
- Check browser console for exact error message

### "Cannot find module" in Lambda
- Lambda needs dependencies. Ensure `package.json` includes `@aws-sdk/*` packages:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```
