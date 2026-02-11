# AWS Setup & Deployment Guide

Complete guide for setting up AWS resources and deploying the IDO Web application.

## Overview

This application uses AWS services for:
- **S3**: Secure file uploads (user photos)
- **DynamoDB**: Order management database
- **Lambda**: Serverless functions for presigned URLs and order processing
- **API Gateway**: HTTP endpoints for Lambda functions

### Security Flow

```
Browser (React App)
    ↓ Request presigned URL
Lambda (presign) → generates S3 credentials (server-side only)
    ↓ Return time-limited presigned URL
Browser → S3 PUT (using presigned URL)
    ↓ Upload photo
Browser → Lambda (create-order)
    ↓ Save order details + photo reference to DynamoDB
```

**Key Security**: AWS credentials never leave the server. Browser only uses presigned URLs (time-limited, single-use).

---

## Prerequisites

Before starting, ensure you have:

1. **AWS Account** with billing enabled
2. **AWS CLI** installed and configured:
   ```bash
   aws configure
   # Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)
   ```
3. **Node.js 20+** installed: `node --version`

Verify AWS setup:
```bash
aws sts get-caller-identity
# Should show your AWS account ID
```

---

## Step 1: Create IAM Role for Lambda Functions

Lambda functions need permissions to access S3 and DynamoDB.

### Via AWS Console:

1. Go to **IAM** → **Roles** → **Create role**
2. Select **AWS service** → **Lambda** → **Next**
3. Create inline policy with this JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::ido-web-uploads/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/ido-orders"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

4. Name role: `ido-lambda-role`
5. Click **Create role**

### Via AWS CLI:

```bash
# Create trust policy
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name ido-lambda-role \
  --assume-role-policy-document file://trust-policy.json

# Attach policy
aws iam put-role-policy \
  --role-name ido-lambda-role \
  --policy-name ido-lambda-policy \
  --policy-document file://lambda-policy.json
```

---

## Step 2: Create S3 Bucket

### Via AWS Console:

1. Go to **S3** → **Create bucket**
2. Bucket name: `ido-web-uploads`
3. Region: `us-east-1`
4. Uncheck "Block public access" (we'll use presigned URLs, not public access)
5. Click **Create bucket**

### Via AWS CLI:

```bash
aws s3 mb s3://ido-web-uploads --region us-east-1
```

### Configure CORS

**Why:** Allow browser PUT requests using presigned URLs

### Via AWS Console:

1. Go to bucket → **Permissions** → **CORS**
2. Add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3001", "http://localhost:5173", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Via AWS CLI:

```bash
cat > cors-config.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedOrigins": ["http://localhost:3001", "http://localhost:5173", "https://your-domain.com"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors \
  --bucket ido-web-uploads \
  --cors-configuration file://cors-config.json
```

---

## Step 3: Create DynamoDB Table

### Via AWS Console:

1. Go to **DynamoDB** → **Create table**
2. Table name: `ido-orders`
3. Partition key: `orderId` (String)
4. Billing: **On-demand** (pay per request)
5. Click **Create**

### Via AWS CLI:

```bash
aws dynamodb create-table \
  --table-name ido-orders \
  --attribute-definitions AttributeName=orderId,AttributeType=S \
  --key-schema AttributeName=orderId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

Verify table created:
```bash
aws dynamodb describe-table --table-name ido-orders
```

---

## Step 4: Deploy Lambda Functions

### Via AWS Console (Manual):

#### Create Presign Lambda:

1. Go to **Lambda** → **Create function**
2. **Function name**: `ido-presign`
3. **Runtime**: Node.js 20.x
4. **Execution role**: Select `ido-lambda-role`
5. Click **Create**
6. Copy code from [lambda/presign/index.js](lambda/presign/index.js) into Code editor
7. **Environment variables**: Add
   - `S3_BUCKET_NAME` = `ido-web-uploads`
   - `S3_FOLDER_PATH` = `user-photos/`
8. Click **Deploy**

#### Create CreateOrder Lambda:

1. Repeat steps 1-5 with function name `ido-create-order`
2. Copy code from [lambda/createOrder/index.js](lambda/createOrder/index.js)
3. **Environment variables**: Add
   - `DYNAMODB_TABLE_NAME` = `ido-orders`
4. Click **Deploy**

### Via AWS CLI:

```bash
# Package Lambda code
cd lambda/presign
zip -r ../presign.zip index.js node_modules/
cd ../..

cd lambda/createOrder
zip -r ../createorder.zip index.js node_modules/
cd ../..

# Create presign Lambda
aws lambda create-function \
  --function-name ido-presign \
  --runtime nodejs20.x \
  --role arn:aws:iam::ACCOUNT_ID:role/ido-lambda-role \
  --handler index.handler \
  --zip-file fileb://lambda/presign.zip \
  --environment Variables="{S3_BUCKET_NAME=ido-web-uploads,S3_FOLDER_PATH=user-photos/}"

# Create create-order Lambda
aws lambda create-function \
  --function-name ido-create-order \
  --runtime nodejs20.x \
  --role arn:aws:iam::ACCOUNT_ID:role/ido-lambda-role \
  --handler index.handler \
  --zip-file fileb://lambda/createorder.zip \
  --environment Variables="{DYNAMODB_TABLE_NAME=ido-orders}"
```

**Install Lambda dependencies:**

```bash
cd lambda/presign
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
zip -r ../../presign.zip index.js node_modules/

cd ../createOrder
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
zip -r ../../createorder.zip index.js node_modules/
```

---

## Step 5: Create API Gateway

### Via AWS Console:

1. Go to **API Gateway** → **Create API** → **REST API**
2. **API name**: `ido-api-dev` → **Create**

#### Create /presign Endpoint:

1. Select **Resources**
2. Right-click `/` → **Create resource**
3. **Resource name**: `presign`
4. Right-click `/presign` → **Create method** → **POST**
5. **Lambda function**: `ido-presign` → **Save**
6. **Actions** → **Enable CORS** → **Enable CORS and replace headers**

#### Create /create-order Endpoint:

1. Right-click `/` → **Create resource**
2. **Resource name**: `create-order`
3. Right-click `/create-order` → **Create method** → **POST**
4. **Lambda function**: `ido-create-order` → **Save**
5. **Actions** → **Enable CORS** → **Enable CORS and replace headers**

#### Deploy API:

1. **Actions** → **Deploy API**
2. **Deployment stage**: `dev` → **Deploy**
3. **Save the Invoke URL**: `https://xxxxx.execute-api.us-east-1.amazonaws.com/dev`

### Via AWS CLI:

```bash
# Create API
API_ID=$(aws apigatewayv2 create-api \
  --name ido-api-dev \
  --protocol-type HTTP \
  --target-arn arn:aws:lambda:us-east-1:ACCOUNT_ID:function:ido-presign \
  --query 'ApiId' \
  --output text)

echo "API ID: $API_ID"

# Get stage ID
STAGE=$(aws apigatewayv2 get-stages --api-id $API_ID --query 'Items[0].StageName' --output text)

# Create integration for presign
INTEGRATION=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-method POST \
  --payload-format-version '2.0' \
  --target-arn arn:aws:lambda:us-east-1:ACCOUNT_ID:function:ido-presign \
  --query 'IntegrationId' \
  --output text)

# Create route for presign
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key 'POST /presign' \
  --target "integrations/$INTEGRATION"

# Repeat for create-order endpoint...
```

---

## Step 6.5: Comprehensive Security Configuration (Production)

This application uses **public API endpoints with strict backend validation** for security. No API keys are stored in the frontend.

### 1️⃣ STRICT LAMBDA VALIDATION (Critical Security Layer)

Both Lambda functions include comprehensive validation:

**Presign Lambda** validates:
- ✅ Filename length ≤ 255 characters
- ✅ Only allowed MIME types (JPEG, PNG, GIF, WebP)
- ✅ No path traversal attempts (`..`, `/`, `\`)
- ✅ 5-minute presigned URL expiry
- ✅ Max file size: 10MB

**CreateOrder Lambda** validates:
- ✅ All required fields present (fullName, email, phone, address, city, state, zipCode)
- ✅ No unknown fields accepted
- ✅ Field length limits (name ≤ 100, email ≤ 254, etc.)
- ✅ Email format validation (regex)
- ✅ Phone number ≥ 10 digits
- ✅ S3 key matches expected pattern (no path traversal)
- ✅ Payload size ≤ 10KB
- ✅ Status forced to `PENDING` server-side (client cannot override)

**Via AWS Console:**
1. Go to **Lambda** → **ido-presign** → **Code**
2. Code already includes validation (see file content)
3. Go to **Lambda** → **ido-create-order** → **Code**
4. Code already includes validation

**Via AWS CLI (deployments):**
```bash
# Redeploy presign Lambda with new validation
cd lambda/presign
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
zip -r ../../presign.zip index.js node_modules/
aws lambda update-function-code \
  --function-name ido-presign \
  --zip-file fileb://../../presign.zip

# Redeploy createOrder Lambda with new validation
cd ../createOrder
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
zip -r ../../createorder.zip index.js node_modules/
aws lambda update-function-code \
  --function-name ido-create-order \
  --zip-file fileb://../../createorder.zip
```

### 2️⃣ API GATEWAY THROTTLING (Block Spam & DDoS)

Prevents request floods and abuse attempts.

**Via AWS Console:**

For HTTP API:
1. Go to **API Gateway** → **ido-api-dev** → **Throttle Settings**
2. Set:
   - **Rate Limit**: 10 requests/second
   - **Burst Limit**: 20 requests
3. Click **Save**

For REST API:
1. Go to **API Gateway** → **Usage Plans** → **Create Usage Plan**
2. Name: `ido-usage-plan-dev`
3. Set:
   - **Rate**: 10 requests/sec
   - **Burst**: 20 requests
4. Click **Create**
5. Add API stage to the plan

**Via AWS CLI:**

```bash
# Get API ID
API_ID=$(aws apigatewayv2 get-apis --query 'Items[0].ApiId' --output text)

# Set throttle settings
aws apigatewayv2 update-stage \
  --api-id $API_ID \
  --stage-name dev \
  --throttle-settings BurstLimit=20,RateLimit=10
```

### 3️⃣ AWS WAF - RATE-BASED RULE (Auto-Block Attackers) skipping for cost cutting 

Automatically blocks IPs making excessive requests.

**Via AWS Console:**

1. Go to **WAF & Shield** → **Web ACLs** → **Create web ACL**
2. Name: `ido-waf`
3. Region: **us-east-1**
4. Click **Next**

5. **Add rules** → **Add my own rules and rule groups**
6. **Rule type**: Select **Rate-based rule**
7. Configure:
   - **Name**: `RateLimitRule`
   - **Rate limit**: 100 requests in 5 minutes
   - **Action**: **Block**
8. Click **Add rule**

9. Click **Next** → **Next** → **Create web ACL**

10. Go to **API Gateway** → **ido-api-dev** → **Settings**
11. Under **WAF association**, select the WAF created above

**Via AWS CLI:**

```bash
# Create IP set for rate limiting
IP_SET=$(aws wafv2 create-ip-set \
  --name ido-rate-limit-set \
  --scope REGIONAL \
  --ip-address-version IPV4 \
  --addresses [] \
  --region us-east-1 \
  --query 'Summary.Id' \
  --output text)

# Create rate-based rule
RULE=$(aws wafv2 create-web-acl \
  --name ido-waf \
  --scope REGIONAL \
  --default-action Block={} \
  --rules '[
    {
      "Name": "RateLimitRule",
      "Priority": 1,
      "Statement": {
        "RateBasedStatement": {
          "Limit": 2000,
          "AggregateKeyType": "IP"
        }
      },
      "Action": {"Block": {}},
      "VisibilityConfig": {
        "SampledRequestsEnabled": true,
        "CloudWatchMetricsEnabled": true,
        "MetricName": "RateLimitRule"
      }
    }
  ]' \
  --visibility-config \
    SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=ido-waf \
  --region us-east-1)

echo "WAF Web ACL created: $RULE"

# Associate with API Gateway (requires API ARN)
API_ARN="arn:aws:apigateway:us-east-1::/apis/ido-api-dev"
aws wafv2 associate-web-acl \
  --web-acl-arn $RULE \
  --resource-arn $API_ARN \
  --region us-east-1
```

### 4️⃣ S3 PRESIGNED URLS - SHORT EXPIRY (Limits Exposure)

Already configured in Lambda - 5 minute expiry on all presigned URLs.

**Why this is secure:**
- URLs are single-use
- Expire in 5 minutes
- Can't be reused after expiration
- Even if URL is leaked, window is small

### 5️⃣ CORS RESTRICTIONS (Prevent Cross-Origin Abuse)

Already configured. S3 only accepts PUT requests from allowed origins.

**Current configuration:**
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3001",
        "https://your-domain.com"
      ],
      "ExposeHeaders": ["ETag", "x-amz-version-id"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

**Update for production:**
```bash
aws s3api put-bucket-cors --bucket ido-web-uploads --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["Content-Type"],
      "AllowedMethods": ["GET", "PUT"],
      "AllowedOrigins": ["https://your-production-domain.com"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}'
```

### 6️⃣ ENABLE LOGGING & MONITORING

**API Gateway Logs:**
```bash
# Create CloudWatch Log Group
aws logs create-log-group --log-group-name /aws/apigateway/ido-api

# Enable logging for API Gateway stage
aws apigatewayv2 update-stage \
  --api-id $API_ID \
  --stage-name dev \
  --access-log-settings '{"DestinationArn":"arn:aws:logs:us-east-1:ACCOUNT_ID:log-group:/aws/apigateway/ido-api","Format":"$context.requestId $context.error.message"}'
```

**View logs:**
```bash
aws logs tail /aws/apigateway/ido-api --follow
aws logs tail /aws/lambda/ido-presign --follow
aws logs tail /aws/lambda/ido-create-order --follow
```

### 7️⃣ SECURITY CHECKLIST FOR PRODUCTION

- [ ] Redeploy Lambda functions with validation code
- [ ] Enable API Gateway throttling (10 req/sec, 20 burst)
- [ ] Deploy AWS WAF with rate-based rule (100 req/5min)
- [ ] Restrict S3 CORS to production domain only
- [ ] Enable CloudWatch logging
- [ ] Test with invalid payloads to verify rejection
- [ ] Monitor CloudWatch logs for attack patterns
- [ ] Set up CloudWatch alarms for WAF blocks
- [ ] Document security settings in runbook

---

## Step 6 (Updated): Configure Frontend

Create or update `.env.local`:

```bash
# AWS Configuration (non-secret values)
REACT_APP_AWS_REGION=us-east-1
REACT_APP_S3_BUCKET_NAME=ido-web-uploads
REACT_APP_DYNAMODB_TABLE_NAME=ido-orders

# API Gateway base URL from Step 5
REACT_APP_API_BASE_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/dev

```

---

## Step 7: Test the Flow

1. **Start dev server:**
```bash
npm run dev
```

2. **Access the app:**
   - Open `http://localhost:3001/#/order`

3. **Test upload:**
   - Click "Upload Photo"
   - Select a JPG/PNG image
   - Click "Place Order"
   - Fill in all fields
   - Submit

4. **Verify in DynamoDB:**
```bash
aws dynamodb scan --table-name ido-orders
```

5. **Check Lambda logs:**
```bash
aws logs tail /aws/lambda/ido-presign --follow
aws logs tail /aws/lambda/ido-create-order --follow
```

---

## Troubleshooting

### "Access Denied" on S3 upload
- Check Lambda IAM role has `s3:PutObject` permission
- Verify S3 bucket CORS is configured correctly:
  ```bash
  aws s3api get-bucket-cors --bucket ido-web-uploads
  ```

### "Function not found" (Lambda 404)
- Verify Lambda functions exist:
  ```bash
  aws lambda list-functions
  ```
- Check API Gateway integration points to correct Lambda
- Grant API Gateway permission to invoke Lambda:
  ```bash
  aws lambda add-permission \
    --function-name ido-presign \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com
  ```

### "DynamoDB table not found"
- Verify table exists:
  ```bash
  aws dynamodb list-tables
  ```
- Check table name in `.env.local` matches exactly

### CORS errors in browser
- Verify API Gateway CORS headers are enabled
- Check S3 bucket CORS configuration
- Test with curl:
  ```bash
  curl -X OPTIONS https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/presign \
    -H "Origin: http://localhost:3001"
  ```

### Lambda timeout errors
- Increase Lambda timeout: **Configuration** → **General** → Timeout (default 3s, try 15s)

### Presigned URL expires immediately
- Check S3_FOLDER_PATH environment variable is set correctly
- Verify Lambda has system time synced with AWS

---

## Cleanup (Delete Resources)

When done testing/deploying:

```bash
# Delete Lambda functions
aws lambda delete-function --function-name ido-presign
aws lambda delete-function --function-name ido-create-order

# Delete API Gateway
aws apigateway delete-rest-api --rest-api-id xxxxx

# Delete DynamoDB table
aws dynamodb delete-table --table-name ido-orders

# Delete S3 bucket (must be empty first)
aws s3 rm s3://ido-web-uploads --recursive
aws s3 rb s3://ido-web-uploads

# Delete IAM role
aws iam delete-role-policy --role-name ido-lambda-role --policy-name ido-lambda-policy
aws iam delete-role --role-name ido-lambda-role
```

---

## Production Deployment

For production:

1. **Use environment-specific resources:**
   - S3: `ido-web-uploads-prod`
   - DynamoDB: `ido-orders-prod`
   - API stage: `prod`

2. **Update CORS origins:**
   ```json
   "AllowedOrigins": ["https://your-production-domain.com"]
   ```

3. **Enable CloudFront** for S3 distribution

4. **Add API authentication** (API Key or Cognito)

5. **Enable CloudWatch monitoring** and alarms

6. **Set up automated backups** for DynamoDB

7. **Use AWS Secrets Manager** for sensitive config

---

## Cost Estimation (Monthly)

| Service | Free Tier | Cost |
|---------|-----------|------|
| S3 | 5GB, 20K GET/PUT | $0.023/GB after, $0.005/1K requests |
| DynamoDB | 25 GB storage, 25 R/W units | On-demand: $1.25/M writes, $0.25/M reads |
| Lambda | 1M invocations, 3.15M seconds | $0.20 per 1M, $0.0000166667/sec |
| API Gateway | - | $3.50 per M requests |

**Typical monthly cost for low-traffic app: $1-5**

