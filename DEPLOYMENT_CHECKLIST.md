# Deployment Checklist

## Pre-Deployment Setup

### 1. Install Global Dependencies
```bash
npm install -g serverless
npm install -g aws-cli
```

### 2. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region (e.g., us-east-1)
# Enter default output format (json)
```

### 3. Create AWS Resources

Run these commands in order:

#### Create S3 Bucket
```bash
aws s3 mb s3://ido-web-photos-$(date +%s) --region us-east-1
# Save the bucket name (show in output)
```

#### Create DynamoDB Table
```bash
aws dynamodb create-table \
  --table-name ido-orders \
  --attribute-definitions AttributeName=orderId,AttributeType=S \
  --key-schema AttributeName=orderId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

#### Configure S3 CORS
```bash
aws s3api put-bucket-cors \
  --bucket YOUR_BUCKET_NAME \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedOrigins": ["*"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"]
    }]
  }' \
  --region us-east-1
```

## Environment Setup

### 4. Create `.env.serverless` File
In project root, create `.env.serverless`:
```env
S3_BUCKET_NAME=ido-web-photos-YOUR_TIMESTAMP
S3_FOLDER_PATH=user-photos/
DYNAMODB_TABLE_NAME=ido-orders
AWS_REGION=us-east-1
```

### 5. Create/Update `.env.local` File
In project root:
```env
GEMINI_API_KEY=your_gemini_key_here
REACT_APP_AWS_REGION=us-east-1
REACT_APP_S3_BUCKET_NAME=ido-web-photos-YOUR_TIMESTAMP
REACT_APP_DYNAMODB_TABLE_NAME=ido-orders
REACT_APP_API_BASE_URL=https://YOUR_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/dev
```

## Deployment Steps

### 6. Install Serverless Plugins
```bash
cd /Users/anandsunchu/Documents/studio\ code/ido-web
npm install --include=dev
```

### 7. Deploy Lambda Functions
```bash
serverless deploy --stage dev
# Copy the API Gateway endpoint URL from output
# Format: https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
```

### 8. Update Frontend Configuration
Paste the API Gateway URL from step 7 into `.env.local`:
```env
REACT_APP_API_BASE_URL=https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
```

### 9. Start Frontend Dev Server
```bash
npm run dev
# Should open http://localhost:3000
```

## Testing

### 10. Test Upload Flow
1. Navigate to http://localhost:3000/#/order
2. Upload a JPG/PNG image (< 10MB)
3. Verify no console errors
4. Fill in all form fields:
   - Full Name
   - Email
   - Phone
   - Street Address
   - City
   - State
   - ZIP Code
5. Click "Place Order"
6. Should see success notification

### 11. Verify Data in DynamoDB
```bash
aws dynamodb scan --table-name ido-orders --region us-east-1
```

Should show your order record with:
- `orderId`: ORDER-TIMESTAMP-RANDOMID
- `fullName`, `email`, `phone`, etc.
- `photoS3Key`: Example path to uploaded photo
- `photoS3Url`: Full S3 URL of photo
- `createdAt`: ISO timestamp
- `status`: "pending"

### 12. View Lambda Logs (Optional)
```bash
serverless logs -f presign --stage dev
serverless logs -f createOrder --stage dev
```

## Troubleshooting

### Issue: "Missing credentials" error
**Solution:** Ensure AWS CLI is configured
```bash
aws sts get-caller-identity
# Should return your AWS account info
```

### Issue: "Lambda function not found" or 404
**Solution:** Verify deployment completed and API URL is correct
```bash
serverless info --stage dev
# Check "endpoints" in output
```

### Issue: "Access Denied" on S3 upload
**Solution:** Check S3 CORS configuration
```bash
aws s3api get-bucket-cors --bucket YOUR_BUCKET_NAME
# Should show AllowedMethods: [GET, PUT, POST]
```

### Issue: "InvalidSignatureException"
**Solution:** Ensure system clock is synced and credentials are correct

### Issue: DynamoDB record not created
**Solution:** Check Lambda errors in CloudWatch
```bash
serverless logs -f createOrder --stage dev --tail
```

## Security Checklist

- ✅ No AWS credentials in `.env.local`
- ✅ No AWS credentials in client code
- ✅ Lambda uses IAM role for S3/DynamoDB access
- ✅ Presigned URLs are time-limited (5 minutes)
- ✅ CORS configured only for necessary methods
- ✅ API Gateway endpoints require 0 authentication (optional to add later)

## Next Steps (Optional)

1. **Add Authentication:** Implement AWS Cognito for order tracking
2. **Add Payment:** Integrate Stripe or other payment processor
3. **Admin Dashboard:** Create order viewing/management interface
4. **Email Notifications:** Send confirmation emails via SES
5. **CDN:** Add CloudFront distribution for faster image delivery
6. **Monitoring:** Set up CloudWatch alarms for errors
7. **Database Backups:** Enable DynamoDB point-in-time recovery

## Cleanup (When Done)

Remove AWS resources to avoid charges:
```bash
# Delete Lambda and API Gateway
serverless remove --stage dev

# Delete S3 bucket
aws s3 rm s3://YOUR_BUCKET_NAME --recursive
aws s3 rb s3://YOUR_BUCKET_NAME

# Delete DynamoDB table
aws dynamodb delete-table --table-name ido-orders --region us-east-1
```

---

**Questions?** Refer to [LAMBDA_DEPLOYMENT.md](LAMBDA_DEPLOYMENT.md) for detailed explanations and security flow diagrams.
