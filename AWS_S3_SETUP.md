# AWS S3 Upload, Presign & Lambda Deployment Guide

## Overview
This document describes the secure flow used by the app:

1. Client requests a presigned S3 URL from a server endpoint (`POST /presign`).
2. Client uploads the photo directly to S3 using that presigned URL (browser PUT).
3. Client submits order details to a secured server endpoint (`POST /create-order`) which stores the order in DynamoDB linked to the S3 key.

Why this flow?
- Keeps AWS credentials off the client (no secrets in the browser)
- Lets server-side Lambdas enforce ACLs, validation, and apply least privilege IAM
- Presigned URLs limit exposure by being short-lived and single-use

Files in this repo:
- `lambda/presign/index.js` — example Lambda that returns a presigned PUT URL
- `lambda/createOrder/index.js` — example Lambda that stores order metadata in DynamoDB

Follow the steps below to configure, deploy, and test.

## Step 1: Create AWS Credentials

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **IAM** (Identity and Access Management)
3. Click on **Users** in the left sidebar
4. Click **Create user** button
5. Enter a username (e.g., `ido-web-user`)
6. Click **Next**
7. Under **Set permissions**, select **Attach policies directly**
8. Search for and select **AmazonS3FullAccess** policy
9. Click **Next** and then **Create user**

## Step 2: Generate Access Keys

1. Click on the newly created user
2. Go to the **Security credentials** tab
3. Under **Access keys**, click **Create access key**
4. Select **Application running outside AWS** (for local development)
5. Click **Next**
6. Copy the **Access Key ID** and **Secret Access Key**
7. Save these securely (never commit them to git!)

## Step 3: Create S3 Bucket

1. Go to [S3 Console](https://s3.console.aws.amazon.com/)
2. Click **Create bucket**
3. Enter bucket name: `ido-web-uploads` (or your preferred name)
4. Select your region (e.g., `us-east-1`)
5. Click **Create bucket**

## Step 4: Configure S3 CORS

To allow browser PUT requests to S3 using presigned URLs, add a CORS rule to the bucket. Example (restrict origins to your dev and production domains):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3001", "http://localhost:5173", "https://your-production-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Save changes.

## Step 5: Environment variables — client vs server

Client `.env.local` (only non-secret values — these are safe to expose):

```bash
# Client-side (non-secret)
REACT_APP_AWS_REGION=us-east-1
REACT_APP_S3_BUCKET_NAME=ido-web-uploads
REACT_APP_DYNAMODB_TABLE_NAME=ido-orders
# API Gateway base URL for your deployed Lambdas
REACT_APP_API_BASE_URL=https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/dev

# Other existing configs
GEMINI_API_KEY=your_gemini_key
```

Server (Lambda) environment variables — set these on the Lambda function configuration in the AWS Console (never in the client):

```
AWS_REGION=us-east-1
S3_BUCKET_NAME=ido-web-uploads
S3_FOLDER_PATH=user-photos/
DYNAMODB_TABLE_NAME=ido-orders
```

Do NOT store `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in the repo or client. For Lambda functions, attach an IAM role with appropriate permissions instead (preferred).

## Step 6: Deploy Lambdas (presign + create-order)

You can deploy the example Lambdas using the Serverless Framework, AWS SAM, or manually in the console. Below are two approaches.

Option A — Serverless Framework (recommended for quick deployment)

1. Install Serverless framework globally (if not installed):

```bash
npm install -g serverless
```

2. Create a `serverless.yml` that deploys two functions and sets environment variables (example snippet):

```yaml
service: ido-web-backend
provider:
  name: aws
  runtime: nodejs18.x
  region: ${env:AWS_REGION}
  environment:
    S3_BUCKET_NAME: ido-web-uploads
    S3_FOLDER_PATH: user-photos/
    DYNAMODB_TABLE_NAME: ido-orders
functions:
  presign:
    handler: lambda/presign/index.handler
    events:
      - http:
          path: presign
          method: post
          cors: true
  createOrder:
    handler: lambda/createOrder/index.handler
    events:
      - http:
          path: create-order
          method: post
          cors: true
```

3. Deploy with:

```bash
serverless deploy --stage dev
```

4. After deployment, note the API Gateway base URL returned by Serverless and set it in your frontend `REACT_APP_API_BASE_URL`.

Option B — AWS SAM / Manual

- You can package and deploy the two handler files as Lambda functions and create HTTP API Gateway routes for `/presign` and `/create-order`. Enable CORS on the API endpoints.
- Make sure each Lambda has the environment variables described in Step 5 and is assigned an IAM role with limited S3 and DynamoDB permissions (see IAM policy below).

## Local / Dev testing

1. Deploy the Lambdas to a dev stage via Serverless or SAM.
2. Set `REACT_APP_API_BASE_URL` in `.env.local` to the API Gateway base URL (e.g. `https://{id}.execute-api.{region}.amazonaws.com/dev`).
3. Restart the dev server:

```bash
npm run dev
```

4. Open `http://localhost:3001/#/order` and test the flow:
  - Click upload → frontend calls `POST ${REACT_APP_API_BASE_URL}/presign` → receives presigned URL
  - Browser PUTs the file to the presigned URL
  - Fill order details and click Proceed → frontend posts to `POST ${REACT_APP_API_BASE_URL}/create-order` with order details + `photoS3Key` + `photoS3Url`

If you prefer not to deploy the Lambdas right away, you can create a small local stub server that returns a mock presign URL and key for UI development. Replace `REACT_APP_API_BASE_URL` with your local server URL in `.env.local`.

## Uploaded Files Location

Files uploaded through the app are stored at:
```
s3://ido-web-uploads/user-photos/{timestamp}-{filename}
```

## Security Best Practices

⚠️ **IMPORTANT:**
- **Never commit `.env.local` to git**
- **Never share your AWS credentials**
- Use `.gitignore` to prevent accidental commits:
  ```
  .env
  .env.local
  .env.*.local
  ```

## For Production Deployment

For production, use AWS IAM roles or temporary credentials instead of long-term access keys:

1. Set up an AWS IAM role for your application
2. Use AWS temporary security credentials
3. Update CORS allowed origins to your production domain

## Troubleshooting

### API returns 403 or presign fails
- Verify the Lambda has the correct environment variables and IAM role allowing `s3:PutObject` for the intended key prefix.

### CORS errors on upload
- Confirm S3 bucket CORS allows your origin and the `PUT` method. If API Gateway returns CORS errors, enable CORS on the API Gateway route.

### File not uploading or invalid file
- Check browser console for network errors and response body from the presign endpoint.
- Ensure file size is under 10MB and file type is supported (JPG/PNG/HEIC).

### Orders not saved in DynamoDB
- Check CloudWatch logs for the `create-order` Lambda. Confirm `DYNAMODB_TABLE_NAME` env var matches the real table name.

## File Validation

The app validates files before upload:
- **Max size**: 10MB
- **Allowed formats**: JPG, PNG, HEIC
- Validation errors are shown in notifications

---

# DynamoDB Setup for Order Management

## Overview
DynamoDB stores order details linked to uploaded photos. This creates a complete record of each order including:
- User contact information
- Shipping address
- Product photo (S3 key and URL)
- Order timestamp
- Order status

## Step 1: Add DynamoDB Permissions to IAM User

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click on your user (created earlier)
3. Click **Add permissions** → **Attach policies directly**
4. Search for and select **AmazonDynamoDBFullAccess**
5. Click **Attach policies**

## Step 2: Create DynamoDB Table

1. Go to [DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
2. Click **Create table**
3. **Table name**: `ido-orders`
4. **Partition key**: `orderId` (String)
5. Under **Table settings**, select **Default settings**
6. Click **Create table**

### Enable DynamoDB Streams (Optional but Recommended)

This allows you to process orders automatically:

1. Go to your table **ido-orders**
2. Click **Exports and streams** tab
3. Under **DynamoDB Streams**, click **Enable**
4. Select **New image** or **New and old images**
5. Click **Enable stream**

## Step 3: Create Secondary Index for Email Queries

This allows you to query orders by customer email:

1. In your **ido-orders** table, go to **Indexes** tab
2. Click **Create index**
3. **Partition key**: `email` (String)
4. **Sort key**: `createdAt` (String)
5. **Index name**: `email-createdAt-index`
6. Click **Create index**

## Step 4: Update .env.local

Add the DynamoDB table name to your `.env.local`:

```bash
# AWS Configuration
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
REACT_APP_AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
REACT_APP_S3_BUCKET_NAME=ido-web-uploads
REACT_APP_DYNAMODB_TABLE_NAME=ido-orders

# Other existing configs
GEMINI_API_KEY=your_gemini_key
```

## How It Works

### Order Submission Flow

1. **User uploads photo** → Saved to S3, returns S3 key and URL
2. **User fills order details** → Form validation
3. **User clicks "Proceed to Payment"** → Order submitted with:
   - All form data (name, email, address, etc.)
   - S3 photo key
   - S3 photo URL
   - Auto-generated Order ID
   - Timestamp
   - Status: "pending"

4. **DynamoDB stores complete order record** linked to photo

### Data Structure

Each order record in DynamoDB contains:

```json
{
  "orderId": "ORDER-1707000000000-ABC123XYZ",
  "email": "customer@example.com",
  "createdAt": "2026-02-10T12:00:00.000Z",
  "photoS3Key": "user-photos/1707000000000-photo.jpg",
  "photoS3Url": "https://ido-web-uploads.s3.us-east-1.amazonaws.com/user-photos/...",
  "status": "pending",
  "fullName": "John Doe",
  "phone": "9876543210",
  "streetAddress": "123 Main St",
  
  "city": "New York",
  "state": "NY",
  "zipCode": "10001"
}
```

## File Structure

The order management functionality uses these files:

- `services/dynamodbService.ts` - DynamoDB operations
- `services/s3Service.ts` - S3 upload operations
- `utilities/awsConfig.ts` - AWS configuration
- `pages/Order.tsx` - Updated with order submission
- `types.ts` - Order data types

## Querying Orders

The app provides utility functions in `dynamodbService.ts`:

### Get order by ID
```typescript
const result = await getOrderById('ORDER-1707000000000-ABC123XYZ');
if (result.success) {
  console.log(result.order); // Full order details with photo
}
```

### Get all orders by customer email
```typescript
const result = await getOrdersByEmail('customer@example.com');
if (result.success) {
  console.log(result.orders); // Array of all orders for this email
}
```

## Cost Estimation

### S3
- Storage: ~$0.023 per GB/month
- Requests: ~$0.005 per 1,000 PUT requests

### DynamoDB (On-Demand)
- Write: $1.25 per million write units
- Read: $0.25 per million read units
- ~$0.25-$1 per month for typical usage

## Troubleshooting

### "DynamoDB table not found"
- Ensure table name in `.env.local` matches exactly
- Check table exists in DynamoDB console
- Verify IAM user has `AmazonDynamoDBFullAccess` policy

### "User details not saved"
- Check browser console for error messages
- Verify photo S3 data is available (`uploadedFile.s3Key` and `s3Url`)
- Check CloudWatch logs for DynamoDB errors

### Orders stored but photo link missing
- Verify S3 upload completed successfully
- Check S3 bucket contains the file
- Ensure `photoS3Key` is passed to `saveOrderToDatabase()`

## Next Steps

After DynamoDB setup:

1. **Add admin dashboard** - View all orders
2. **Implement email notifications** - Notify customers of order status changes
3. **Add payment integration** - Capture payment and update order status
4. **Set up order processing** - Trigger 3D design creation on payment
5. **Create order tracking** - Customers can check order status using Order ID
6. **Configure Lambda triggers** - Auto-process orders via DynamoDB Streams

---

## Next Steps

After setup, the uploaded files are stored in S3. You may want to:
1. Integrate with DynamoDB to store upload metadata
2. Set up CloudFront CDN for faster delivery
3. Configure lifecycle policies to delete old uploads
4. Set up backup and versioning for S3 bucket

## Serverless / Lambda Setup (recommended)

To keep credentials secure, run AWS operations (presigning and DynamoDB writes) from server-side code such as AWS Lambda behind API Gateway. The frontend will:

- Request a presigned URL from `POST /presign` (Lambda)
- Upload the file to S3 using the presigned URL (browser PUT)
- Call `POST /create-order` (Lambda) to store order details linked to the S3 key

Sample Lambda handlers are included in the repository under `lambda/`:

- `lambda/presign/index.js` — returns `{ success, url, key, fileUrl }` for PUT uploads
- `lambda/createOrder/index.js` — stores the order in DynamoDB and returns `{ success, orderId }`

Set the following environment variables on the Lambda functions (NOT in the frontend):

```
AWS_REGION=us-east-1
S3_BUCKET_NAME=ido-web-uploads
S3_FOLDER_PATH=user-photos/
DYNAMODB_TABLE_NAME=ido-orders
```

Attach an IAM role to the Lambdas with least-privilege permissions (S3 PutObject on your bucket path, and DynamoDB PutItem for the table). Example policy snippet:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject"],
      "Resource": "arn:aws:s3:::ido-web-uploads/user-photos/*"
    },
    {
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem"],
      "Resource": "arn:aws:dynamodb:*:*:table/ido-orders"
    }
  ]
}
```

Expose the Lambdas via API Gateway, enable CORS, and set `REACT_APP_API_BASE_URL` in your frontend to the API Gateway base URL.

This flow prevents any AWS credentials from being included in your client bundle and centralizes security and permissions on the server-side.
