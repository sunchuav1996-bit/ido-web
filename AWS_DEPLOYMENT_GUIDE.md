# AWS Deployment - Quick Start

## 📖 Main Guide

**👉 Follow this:** [AWS_SETUP.md](AWS_SETUP.md)

All AWS setup and deployment instructions are in one consolidated guide.

---

## 7-Step Overview

1. **Create IAM Role** - Permissions for Lambda
2. **Create S3 Bucket** - File uploads + CORS
3. **Create DynamoDB Table** - Order database
4. **Deploy Lambda Functions** - ido-presign & ido-create-order
5. **Create API Gateway** - HTTP endpoints
6. **Configure Frontend** - Update `.env.local`
7. **Test** - Upload file → Save order

**Time: ~20-30 minutes**

---

## Key Changes

✅ Removed Serverless Framework
✅ AWS Console only (simpler & transparent)
✅ Node.js 25.6.0 (upgraded from 18)
✅ Consolidated documentation
✅ All steps verified

---

## Cost

- **Free tier:** 12 months free (S3 5GB, DynamoDB 25GB, Lambda 1M invocations)
- **After free tier:** ~$1-5/month typical usage

---

## System Requirements

- AWS Account (with billing enabled)
- AWS CLI: `aws configure`
- Node.js 20+
