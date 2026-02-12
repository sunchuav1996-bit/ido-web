# AWS Minimal Cost Deployment Guide

**Goal:** Deploy the IDO Web application on AWS with minimum costs, leveraging the free tier and cost-optimization strategies.

---

## 💰 Cost Breakdown

| Service | Free Tier | Typical Monthly Cost | Notes |
|---------|-----------|---------------------|-------|
| **S3** | 5 GB storage | $0.99/month after free tier | After 12 months |
| **DynamoDB** | 25 GB storage + 1M requests | $1-2/month | On-demand pricing is higher but no commitment |
| **Lambda** | 1M invocations/month | Free | First year, then minimal |
| **API Gateway** | 1M requests/month | Free | High traffic is cheaper with REST API |
| **CloudFront** | 1 TB egress/month | Free | First year, then ~$0.085/GB |
| **CloudWatch** | 5 GB logs | $0.50/month | Minimal for development |
| **Total (Free Tier)** | - | **$0/month** | 12 months |
| **Total (After Free Tier)** | - | **~$2-4/month** | Low traffic |

---

## 🎯 Cost Optimization Strategies

### 1. **Use AWS Free Tier Wisely**
- Sign up for AWS free tier account
- Monitor usage in [AWS Billing Dashboard](https://console.aws.amazon.com/billing/)
- Set up **cost alerts** to avoid surprises

### 2. **Choose Right Database Pricing Model**
- **DynamoDB**: Use **On-Demand** billing (no minimum commitment)
  - Pay per read/write: `$1.25/million write units, $0.25/million read units`
  - Perfect for low-traffic projects
  - Alternative: Provisioned with 1 write/1 read unit = ~$0.50/month

### 3. **Minimize S3 Costs**
- Use **standard storage class** (default)
- **Lifecycle policies**: Delete old uploads after 30 days
- Enable **S3 Transfer Acceleration** only if needed
- Use **single region** (no replication)

### 4. **Lambda Cost Control**
- ~1M free invocations/month
- Each function execution: 128 MB memory, 3 sec duration = ~free at low traffic
- Monitor with CloudWatch

### 5. **Avoid These Expensive Services**
- ❌ **CloudFront** (use S3 directly in same region)
- ❌ **NAT Gateway** ($32/month)
- ❌ **Data Transfer** (keep everything in same region)
- ❌ **Provisioned DynamoDB** (use on-demand)

---

## 📋 Step-by-Step Minimal Cost Setup

### **Prerequisites**
```bash
# 1. Create AWS account (with free tier)
# 2. Install AWS CLI
aws --version

# 3. Configure AWS credentials
aws configure
# Region: us-east-1 (cheapest US region)
# Output: json
```

### **Step 1: Set Up AWS Billing Alerts (IMPORTANT!)**

**Via AWS Console:**

1. Go to **Billing Dashboard** → **Billing preferences**
2. Enable **Receive Billing Alerts** (free)
3. Go to **CloudWatch** → **Alarms** → **Create alarm**
4. Monitor metric: `EstimatedCharges`
5. Set threshold: `$5` to get notified before charges

**Or via CLI:**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name aws-monthly-cost-limit \
  --alarm-description "Alert if monthly charges exceed $5" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanOrEqualToThreshold
```

---

### **Step 2: Create S3 Bucket (with lifecycle policy)**

```bash
# Create bucket (replace with unique name)
BUCKET_NAME="ido-web-uploads-$(date +%s)"
aws s3 mb s3://$BUCKET_NAME --region us-east-1

# Enable versioning (optional, skip for minimal cost)
# aws s3api put-bucket-versioning \
#   --bucket $BUCKET_NAME \
#   --versioning-configuration Status=Enabled

# Create lifecycle policy to delete old files after 30 days
cat > /tmp/lifecycle.json << 'EOF'
{
  "Rules": [
    {
      "Id": "DeleteOldUploads",
      "Status": "Enabled",
      "Prefix": "",
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket $BUCKET_NAME \
  --lifecycle-configuration file:///tmp/lifecycle.json

# Enable CORS
cat > /tmp/cors.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
EOF

aws s3api put-bucket-cors \
  --bucket $BUCKET_NAME \
  --cors-configuration file:///tmp/cors.json
```

**Save bucket name:**
```bash
echo "export BUCKET_NAME=$BUCKET_NAME" >> ~/.bashrc
source ~/.bashrc
```

---

### **Step 3: Create DynamoDB Table (On-Demand)**

```bash
# Create orders table
aws dynamodb create-table \
  --table-name ido-orders \
  --attribute-definitions \
    AttributeName=orderId,AttributeType=S \
  --key-schema \
    AttributeName=orderId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create contact messages table
aws dynamodb create-table \
  --table-name ido-contact-messages \
  --attribute-definitions \
    AttributeName=messageId,AttributeType=S \
  --key-schema \
    AttributeName=messageId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Verify tables created
aws dynamodb list-tables --region us-east-1
```

---

### **Step 4: Create IAM Role for Lambda**

```bash
# Create trust policy file
cat > /tmp/lambda-trust.json << 'EOF'
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
  --assume-role-policy-document file:///tmp/lambda-trust.json

# Create inline policy for S3 + DynamoDB access
cat > /tmp/lambda-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::ido-web-uploads-*/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/ido-orders",
        "arn:aws:dynamodb:us-east-1:*:table/ido-contact-messages"
      ]
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
EOF

aws iam put-role-policy \
  --role-name ido-lambda-role \
  --policy-name ido-lambda-policy \
  --policy-document file:///tmp/lambda-policy.json

# Get role ARN
ROLE_ARN=$(aws iam get-role --role-name ido-lambda-role --query 'Role.Arn' --output text)
echo "Role ARN: $ROLE_ARN"
```

---

### **Step 5: Deploy Lambda Functions**

```bash
# Create function directory
mkdir -p /tmp/lambda-presign
cd /tmp/lambda-presign

# Copy presign Lambda function from your repo
cp lambda/presign/index.js .

# Zip it
zip function.zip index.js

# Deploy
aws lambda create-function \
  --function-name ido-presign \
  --runtime nodejs20.x \
  --role $ROLE_ARN \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 256 \
  --environment "Variables={AWS_REGION=us-east-1,S3_BUCKET=$BUCKET_NAME}" \
  --region us-east-1

# Repeat for other Lambda functions
# create-order, save-contact-message, etc.
```

---

### **Step 6: Create API Gateway (HTTP API - cheaper)**

```bash
# Create HTTP API (cheaper than REST API)
API_ID=$(aws apigatewayv2 create-api \
  --name ido-api \
  --protocol-type HTTP \
  --target lambda \
  --payloadFormatVersion 2.0 \
  --query 'ApiId' \
  --output text \
  --region us-east-1)

echo "API ID: $API_ID"

# Create routes and integrations via AWS Console (more reliable)
# Or use CloudFormation for full automation
```

**Via AWS Console (recommended for first-time):**

1. Go to **API Gateway** → **Create API**
2. Choose **HTTP API** (cheaper)
3. Create routes:
   - `GET /presign` → Lambda: `ido-presign`
   - `POST /order` → Lambda: `ido-create-order`
   - `POST /contactMessage` → Lambda: `ido-saveContactMessage`
4. Enable CORS for all routes
5. Deploy to default stage
6. Copy **Invoke URL**

---

### **Step 7: Update Frontend Environment Variables**

```bash
# Create .env.local file in project root
cat > .env.local << 'EOF'
VITE_API_ENDPOINT=https://<api-id>.execute-api.us-east-1.amazonaws.com
VITE_S3_BUCKET=ido-web-uploads-xxxxx
VITE_AWS_REGION=us-east-1
EOF
```

---

### **Step 8: Test Deployment**

```bash
# 1. Start dev server
npm run dev

# 2. Test presign endpoint
curl -X GET "https://<api-id>.execute-api.us-east-1.amazonaws.com/presign?filename=test.jpg"

# 3. Test contact message
curl -X POST "https://<api-id>.execute-api.us-east-1.amazonaws.com/contactMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "message": "This is a test message with enough characters"
  }'

# 4. Check DynamoDB
aws dynamodb scan --table-name ido-contact-messages --region us-east-1
```

---

## 🚀 Advanced: Infrastructure as Code (CloudFormation)

**For complete automation, use CloudFormation:**

```bash
# Deploy entire stack
aws cloudformation create-stack \
  --stack-name ido-web-stack \
  --template-body file://cloudformation.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1

# Monitor stack creation
aws cloudformation describe-stacks \
  --stack-name ido-web-stack \
  --region us-east-1
```

---

## 📊 Monitor Costs

### Real-time Monitoring
```bash
# Check billing
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE

# Check Lambda costs
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-31T23:59:59Z \
  --period 2592000 \
  --statistics Sum
```

### AWS Console
1. Go to **Billing Dashboard**
2. Check **Costs by Service**
3. Review **Usage** for each service

---

## ⚠️ Cost Control Checklist

- [ ] Set up billing alerts ($5 threshold)
- [ ] Use S3 lifecycle policy (delete after 30 days)
- [ ] Use DynamoDB **on-demand** (not provisioned)
- [ ] Use **HTTP API** (not REST API)
- [ ] All services in **same region** (us-east-1 = cheapest)
- [ ] No CloudFront, NAT Gateway, or cross-region replication
- [ ] Monitor Lambda function durations (aim for <3 sec)
- [ ] Compress images before upload
- [ ] Enable **S3 Block Public Access** (security)

---

## 🔐 Security Best Practices (Free)

```bash
# Block S3 public access
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Enable S3 encryption
aws s3api put-bucket-encryption \
  --bucket $BUCKET_NAME \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Enable DynamoDB encryption
aws dynamodb update-table \
  --table-name ido-orders \
  --sse-specification-update '{
    "Enabled": true,
    "SSEType": "KMS"
  }' \
  --region us-east-1
```

---

## 📞 Support & Troubleshooting

| Issue | Solution |
|-------|----------|
| Lambda timeout | Increase timeout in Lambda configuration |
| CORS errors | Update CORS in API Gateway → Stages → CORS |
| DynamoDB throttling | Switch to on-demand billing mode |
| S3 403 errors | Check IAM policy and bucket CORS settings |
| High bills | Check data transfer costs (keep in same region) |

---

## 📈 Scaling Without Breaking Budget

When traffic increases:

1. **Keep HTTP API** (cheaper than REST at scale)
2. **Maintain on-demand DynamoDB** (auto-scales)
3. **Monitor S3 transfer costs** (consider CloudFront if >1TB/month)
4. **Use Lambda reserved concurrency** (stable cost)
5. **Compress data** (reduce transfer costs)

---

## 🎉 Cost Summary

| Scenario | Monthly Cost |
|----------|--------------|
| **Free Tier (Year 1)** | $0 |
| **Low Traffic (1,000 orders/month)** | ~$2-3 |
| **Medium Traffic (10,000 orders/month)** | ~$5-10 |
| **High Traffic (100,000 orders/month)** | ~$20-50 |

All estimates assume US-East-1 region and optimized architecture.

---

**Last Updated:** February 2026
**Region:** us-east-1 (N. Virginia)
**Estimated Setup Time:** 30-45 minutes
