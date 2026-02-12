# AWS Deployment Checklist - Quick Reference

Use this checklist while deploying to AWS with minimal costs.

---

## ✅ Pre-Deployment Setup

- [ ] AWS Free Tier account created
- [ ] AWS CLI installed: `aws --version`
- [ ] AWS credentials configured: `aws configure`
  - Region: `us-east-1` (cheapest)
  - Output: `json`
- [ ] Verified AWS access: `aws sts get-caller-identity`
- [ ] Billing alerts enabled (threshold: $5)

---

## ✅ Step 1: S3 Bucket Setup

- [ ] Created S3 bucket: `ido-web-uploads-*`
- [ ] Saved bucket name to environment variable
- [ ] Enabled CORS (GET, PUT, POST)
- [ ] Applied lifecycle policy (delete after 30 days)
- [ ] Enabled encryption (AES256)
- [ ] Blocked public access
- [ ] Bucket name: `________________`

---

## ✅ Step 2: DynamoDB Tables

- [ ] Created `ido-orders` table
  - Partition key: `orderId` (String)
  - Billing: **On-Demand**
- [ ] Created `ido-contact-messages` table
  - Partition key: `messageId` (String)
  - Billing: **On-Demand**
- [ ] Encryption enabled (KMS)
- [ ] Verified tables are "Active"

---

## ✅ Step 3: IAM Role & Permissions

- [ ] Created role: `ido-lambda-role`
- [ ] Added S3 permissions (GetObject, PutObject)
- [ ] Added DynamoDB permissions (PutItem, GetItem, Query)
- [ ] Added CloudWatch Logs permissions
- [ ] Role ARN: `arn:aws:iam::____________:role/ido-lambda-role`

---

## ✅ Step 4: Lambda Functions

### Function: `ido-presign`
- [ ] Runtime: Node.js 20.x
- [ ] Role: `ido-lambda-role`
- [ ] Memory: 256 MB
- [ ] Timeout: 30 seconds
- [ ] Environment variables:
  - `S3_BUCKET`: `________________`
  - `AWS_REGION`: `us-east-1`
- [ ] Code deployed: `lambda/presign/index.js`
- [ ] Function ARN: `arn:aws:lambda:____________:function:ido-presign`

### Function: `ido-create-order`
- [ ] Runtime: Node.js 20.x
- [ ] Role: `ido-lambda-role`
- [ ] Memory: 256 MB
- [ ] Timeout: 30 seconds
- [ ] Environment variables:
  - `ORDERS_TABLE`: `ido-orders`
  - `S3_BUCKET`: `________________`
  - `AWS_REGION`: `us-east-1`
- [ ] Code deployed: `lambda/createOrder/index.js`

### Function: `ido-saveContactMessage`
- [ ] Runtime: Node.js 20.x
- [ ] Role: `ido-lambda-role`
- [ ] Memory: 256 MB
- [ ] Timeout: 30 seconds
- [ ] Environment variables:
  - `CONTACT_MESSAGES_TABLE`: `ido-contact-messages`
  - `AWS_REGION`: `us-east-1`
- [ ] Code deployed: `lambda/saveContactMessage/index.js`

---

## ✅ Step 5: API Gateway (HTTP API - Minimal Cost)

- [ ] API created: `ido-api`
- [ ] Protocol: **HTTP API** (not REST)
- [ ] Routes created:
  - [ ] `GET /presign` → `ido-presign` Lambda
  - [ ] `POST /order` → `ido-create-order` Lambda
  - [ ] `POST /contactMessage` → `ido-saveContactMessage` Lambda
- [ ] CORS enabled for all routes:
  - Origins: `http://localhost:5173`, `https://yourdomain.com`
  - Methods: GET, POST, OPTIONS
  - Headers: *
- [ ] API deployed to default stage
- [ ] Invoke URL: `https://________________.execute-api.us-east-1.amazonaws.com`

---

## ✅ Step 6: Frontend Configuration

- [ ] Created `.env.local` file
- [ ] Environment variables set:
  ```
  VITE_API_ENDPOINT=https://________________.execute-api.us-east-1.amazonaws.com
  VITE_S3_BUCKET=ido-web-uploads-________________
  VITE_AWS_REGION=us-east-1
  ```

---

## ✅ Step 7: Testing

- [ ] Dev server running: `npm run dev`
- [ ] Test presign endpoint:
  ```bash
  curl -X GET "https://<api-id>.execute-api.us-east-1.amazonaws.com/presign?filename=test.jpg"
  ```
- [ ] Test contact message:
  ```bash
  curl -X POST "https://<api-id>.execute-api.us-east-1.amazonaws.com/contactMessage" \
    -H "Content-Type: application/json" \
    -d '{"name":"John","email":"john@test.com","phone":"9876543210","message":"Test message with minimum characters"}'
  ```
- [ ] Contact form submission successful
- [ ] Order creation successful
- [ ] Files uploaded to S3
- [ ] Data stored in DynamoDB

---

## ✅ Security Hardening

- [ ] S3 Block Public Access enabled
- [ ] S3 encryption (AES256) enabled
- [ ] DynamoDB encryption (KMS) enabled
- [ ] API Gateway CORS restricted to known origins
- [ ] Lambda functions use least privilege IAM role
- [ ] No AWS credentials in frontend code
- [ ] Environment variables never committed to git

---

## ✅ Cost Optimization

- [ ] All resources in **us-east-1** (cheapest region)
- [ ] DynamoDB: **On-Demand** billing (not provisioned)
- [ ] API Gateway: **HTTP API** (not REST)
- [ ] S3 Lifecycle: Delete old uploads after 30 days
- [ ] Lambda memory: 256 MB (reasonable for typical workloads)
- [ ] No CloudFront enabled
- [ ] No NAT Gateway
- [ ] No cross-region replication
- [ ] Billing alerts set: **$5 threshold**

---

## ✅ Monitoring & Alerts

- [ ] CloudWatch billing alarm created
- [ ] SNS email notifications enabled
- [ ] CloudWatch Logs retention: 7 days (sufficient, saves cost)
- [ ] Lambda error logs monitored
- [ ] DynamoDB read/write capacity monitored
- [ ] S3 access logs enabled (optional)

---

## ✅ Deployment Verification

- [ ] Frontend deployed (or ready for deployment)
- [ ] API endpoints tested and working
- [ ] Database stores data correctly
- [ ] Files upload to S3 successfully
- [ ] Error handling works (validation errors show)
- [ ] No console errors in browser
- [ ] Contact form sends properly
- [ ] Order creation saves to DynamoDB

---

## 📊 Current Costs Estimate

| Service | Tier | Cost |
|---------|------|------|
| S3 | Free (5GB) | $0 |
| DynamoDB | Free (25GB) | $0 |
| Lambda | Free (1M invocations) | $0 |
| API Gateway | Free (1M requests) | $0 |
| **Total Monthly** | - | **$0** |

*Valid for 12 months. After free tier, expect ~$2-5/month at low traffic.*

---

## 🆘 Troubleshooting Quick Fixes

| Problem | Fix |
|---------|-----|
| CORS error | Update API Gateway CORS origins |
| 403 S3 error | Check IAM policy and bucket CORS |
| Lambda timeout | Increase timeout in Lambda settings |
| Missing environment vars | Verify `.env.local` and Lambda env variables |
| DynamoDB throttle | Switch to on-demand billing mode |
| High bills | Check data transfer costs, ensure same region |

---

## 📝 Notes

- Date deployed: `________________`
- AWS Account ID: `________________`
- API Endpoint: `________________`
- S3 Bucket: `________________`
- Admin email: `________________`

---

**Status:** [ ] Complete  
**Last Updated:** February 2026
