# AWS Frontend Deployment Guide (S3 + CloudFront)

Deploy your React app to AWS with minimal cost: **$0 first year, ~$1-5/month after**.

---

## 🎯 Architecture

```
Your Domain (example.com)
         ↓
    Route 53 / DNS
         ↓
    CloudFront (CDN)
         ↓
    S3 (React Build Files)
         ↓ (API calls)
    API Gateway
         ↓
    Lambda Functions
         ↓
    DynamoDB + S3
```

---

## 💰 Cost Breakdown

| Service | Free Tier | After 12 mo | Notes |
|---------|-----------|-------------|-------|
| **S3** | 5GB | $0.99/mo | Static files ~50MB |
| **CloudFront** | 1TB/month | $0.085/GB | First year free, then ~20GB = $1.70 |
| **Route 53** | - | $0.50/mo | Monthly charge (always) |
| **Lambda** | 1M/month | Free | Your backend (same as before) |
| **Total** | - | **~$2-3/mo** | Very minimal |

---

## 📋 Prerequisites

1. ✅ AWS Account with free tier
2. ✅ Custom domain registered (Route 53 or external)
3. ✅ Backend already deployed (see `AWS_MINIMAL_COST_DEPLOY.md`)
4. ✅ Node.js 20+ and npm installed
5. ✅ AWS CLI configured

---

## 🚀 Step 1: Build React Application

```bash
# Navigate to project root
cd /path/to/ido-web

# Install dependencies (if not done)
npm install

# Build production bundle
npm run build

# Verify build output
ls -la dist/
# Should see: index.html, assets/, and other static files
```

**What gets built:**
- `dist/index.html` - Main app
- `dist/assets/` - JS/CSS bundles
- Small file size (~1-3 MB typically)

---

## 🪣 Step 2: Create S3 Bucket for Frontend

```bash
# Create bucket (use unique name with your domain)
FRONTEND_BUCKET="ido-web-frontend-$(date +%s)"
aws s3 mb s3://$FRONTEND_BUCKET --region us-east-1

# Enable static website hosting
aws s3api put-bucket-website \
  --bucket $FRONTEND_BUCKET \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "index.html"}
  }'

# Save bucket name
echo "export FRONTEND_BUCKET=$FRONTEND_BUCKET" >> ~/.bashrc
source ~/.bashrc
```

### Enable Block Public Access (Security)

```bash
# Block all public access (CloudFront will use OAI instead)
aws s3api put-public-access-block \
  --bucket $FRONTEND_BUCKET \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

### Create Bucket Policy for CloudFront

```bash
# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create OAI (Origin Access Identity)
OAI_ID=$(aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config '{
    "CallerReference": "'$(date +%s)'",
    "Comment": "OAI for ido-web-frontend"
  }' \
  --query 'CloudFrontOriginAccessIdentity.Id' \
  --output text)

echo "OAI ID: $OAI_ID"

# Create bucket policy
cat > /tmp/bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity/PLACE_OAI_ID_HERE"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::PLACE_BUCKET_NAME_HERE/*"
    }
  ]
}
EOF

# Replace placeholders
sed -i "" "s|PLACE_BUCKET_NAME_HERE|$FRONTEND_BUCKET|g" /tmp/bucket-policy.json
sed -i "" "s|PLACE_OAI_ID_HERE|$OAI_ID|g" /tmp/bucket-policy.json

# Apply policy
aws s3api put-bucket-policy \
  --bucket $FRONTEND_BUCKET \
  --policy file:///tmp/bucket-policy.json
```

### Upload Build Files to S3

```bash
# Upload all files from dist/ folder
aws s3 sync dist/ s3://$FRONTEND_BUCKET/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# Upload index.html with no cache
aws s3 cp dist/index.html s3://$FRONTEND_BUCKET/index.html \
  --content-type "text/html" \
  --cache-control "public, max-age=0, must-revalidate"

echo "✅ Build files uploaded to S3"
```

---

## 🌐 Step 3: Create CloudFront Distribution

### Via AWS CLI

```bash
# Create CloudFront distribution
cat > /tmp/cloudfront-config.json << 'EOF'
{
  "CallerReference": "ido-web-REPLACE_TIMESTAMP",
  "Comment": "IDO Web Application",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3Origin",
        "DomainName": "REPLACE_BUCKET_NAME.s3.us-east-1.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": "origin-access-identity/cloudfront/REPLACE_OAI_ID"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3Origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      },
      "Headers": {
        "Quantity": 0
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CacheBehaviors": [
    {
      "PathPattern": "/index.html",
      "TargetOriginId": "S3Origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "TrustedSigners": {
        "Enabled": false,
        "Quantity": 0
      },
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {
          "Forward": "none"
        },
        "Headers": {
          "Quantity": 0
        }
      },
      "MinTTL": 0,
      "DefaultTTL": 0,
      "MaxTTL": 0
    }
  ],
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
EOF

# Replace placeholders
sed -i "" "s|REPLACE_TIMESTAMP|$(date +%s)|g" /tmp/cloudfront-config.json
sed -i "" "s|REPLACE_BUCKET_NAME|$FRONTEND_BUCKET|g" /tmp/cloudfront-config.json
sed -i "" "s|REPLACE_OAI_ID|$OAI_ID|g" /tmp/cloudfront-config.json

# Create distribution
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
  --distribution-config file:///tmp/cloudfront-config.json \
  --query 'Distribution.Id' \
  --output text)

echo "CloudFront Distribution ID: $DISTRIBUTION_ID"
echo "export DISTRIBUTION_ID=$DISTRIBUTION_ID" >> ~/.bashrc
source ~/.bashrc

# Get CloudFront domain
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
  --id $DISTRIBUTION_ID \
  --query 'Distribution.DomainName' \
  --output text)

echo "CloudFront Domain: $CLOUDFRONT_DOMAIN"
```

**Wait for distribution to deploy (3-5 minutes):**

```bash
# Check deployment status
aws cloudfront get-distribution \
  --id $DISTRIBUTION_ID \
  --query 'Distribution.Status' \
  --output text
# Wait until shows: Deployed
```

### Via AWS Console (Recommended for first-time)

If CLI is complex, use console:

1. Go to **CloudFront** → **Create distribution**
2. **Origin** (S3 bucket):
   - Origin domain: Select your S3 bucket
   - Origin access: **Origin access control settings** → Create new
   - Select **S3 (Recommended)**
3. **Default cache behavior**:
   - Viewer protocol policy: **Redirect HTTP to HTTPS**
   - Cache key and origin requests: **Cache policy and origin request policy**
   - Cache policy: **CachingOptimized**
   - Origin request policy: **CORS-S3Origin**
4. **Settings**:
   - Price class: **PriceClass_100** (cheapest)
   - Default root object: **index.html**
   - Enable IPv6: **Yes**
5. Create distribution

---

## 🔗 Step 4: Set Up Custom Domain with Route 53

### Option A: Register Domain in Route 53 (Integrated)

```bash
# Register domain (costs vary, ~$10-15/year)
# Go to Route 53 → Register domain (via console, easier)
# Follow prompts to register your domain
```

### Option B: Domain Already Registered (External or Route 53)

```bash
# Create hosted zone for your domain
DOMAIN="example.com"
HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
  --name $DOMAIN \
  --caller-reference $(date +%s) \
  --query 'HostedZone.Id' \
  --output text | cut -d'/' -f3)

echo "Hosted Zone ID: $HOSTED_ZONE_ID"

# Create A record pointing to CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "'$DOMAIN'",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "'$CLOUDFRONT_DOMAIN'",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'

# Also create www subdomain
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.'$DOMAIN'",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "'$CLOUDFRONT_DOMAIN'"}]
      }
    }]
  }'
```

### Option C: External DNS (GoDaddy, Namecheap, etc.)

1. In external DNS provider: Create DNS records
   - **Type A record**: `example.com` → CloudFront domain name
   - **Type CNAME record**: `www.example.com` → CloudFront domain name
2. Replace CloudFront domain with your `$CLOUDFRONT_DOMAIN` value (from Step 3)

---

## 🔐 Step 5: Enable HTTPS with ACM Certificate

### For CloudFront (recommended)

```bash
# Request certificate in us-east-1 (required for CloudFront)
CERTIFICATE_ARN=$(aws acm request-certificate \
  --domain-name example.com \
  --subject-alternative-names www.example.com \
  --validation-method DNS \
  --region us-east-1 \
  --query 'CertificateArn' \
  --output text)

echo "Certificate ARN: $CERTIFICATE_ARN"

# Verify certificate (check email or use DNS validation)
# Then update CloudFront distribution to use certificate
```

---

## 🔧 Step 6: Update Frontend Environment Variables

```bash
# Update .env.local with your backend API and domain
cat > /path/to/ido-web/.env.local << 'EOF'
VITE_API_ENDPOINT=https://<your-api-id>.execute-api.us-east-1.amazonaws.com
VITE_S3_BUCKET=ido-web-uploads-xxxxx
VITE_AWS_REGION=us-east-1
VITE_APP_URL=https://example.com
EOF

# Rebuild with updated env
npm run build

# Sync new build to S3
aws s3 sync dist/ s3://$FRONTEND_BUCKET/ --delete --cache-control "public, max-age=31536000" --exclude "index.html"
aws s3 cp dist/index.html s3://$FRONTEND_BUCKET/index.html --content-type "text/html" --cache-control "public, max-age=0, must-revalidate"

# Invalidate CloudFront cache (so new files are served)
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

---

## 🧪 Step 7: Test Deployment

```bash
# 1. Test via CloudFront domain (takes 3-5 min to be live)
curl https://$CLOUDFRONT_DOMAIN/

# 2. Test via custom domain (after DNS propagates, ~5-30 min)
curl https://example.com/

# 3. Test in browser
# Go to https://example.com
# Check console for API calls working
# Test contact form
# Test order creation
```

---

## 🔄 Step 8: Setup Continuous Deployment (Optional)

### Deploy updates automatically

```bash
#!/bin/bash
# save as: deploy.sh

set -e

echo "🔨 Building React app..."
npm run build

echo "📤 Uploading to S3..."
aws s3 sync dist/ s3://$FRONTEND_BUCKET/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

aws s3 cp dist/index.html s3://$FRONTEND_BUCKET/index.html \
  --content-type "text/html" \
  --cache-control "public, max-age=0, must-revalidate"

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "✅ Deployment complete!"
echo "🌐 Live at: https://example.com"
```

**Make executable and run:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📊 Monitor & Maintain

### Check CloudFront Performance

```bash
# View cache hit ratio
aws cloudfront get-distribution \
  --id $DISTRIBUTION_ID \
  --query 'Distribution.DistributionConfig.DefaultCacheBehavior.CachePolicyId'

# View access logs (if enabled)
aws s3 ls s3://$FRONTEND_BUCKET/logs/
```

### Clear Cache When Needed

```bash
# Invalidate all files
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

# Invalidate specific path
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/index.html" "/assets/*"
```

---

## 🔒 Security Checklist

- [ ] S3 bucket has Block Public Access enabled
- [ ] Only CloudFront can access S3 (via OAI)
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] ACM certificate installed
- [ ] CloudFront only serves from trusted origins
- [ ] No AWS credentials in frontend code
- [ ] Environment variables use `.env.local` (not committed)

---

## ⚡ Performance Tips

### Optimize Bundle Size

```bash
# Check build size
npm run build
du -sh dist/

# Analyze what's included
npm install --save-dev vite-plugin-visualizer
```

### CloudFront Caching Strategy

**Static assets (JS, CSS):**
- Cache-Control: `public, max-age=31536000` (1 year)

**index.html:**
- Cache-Control: `public, max-age=0, must-revalidate` (always fresh)

**API responses:**
- Handle in Lambda/backend with appropriate headers

---

## 💸 Cost Optimization

| Action | Savings |
|--------|---------|
| Use **PriceClass_100** (cheapest regions) | -50% on CloudFront |
| Delete old CloudFront logs (if enabled) | -$5-10/month |
| Compress images before upload | Lower bandwidth |
| Use **gzip compression** (automatic) | ~70% smaller |
| Avoid unnecessary cache invalidations | Free (1,000/mo free) |

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Access Denied" S3 error | Check bucket policy and OAI settings |
| CloudFront shows old files | Run invalidation: `aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"` |
| Domain not resolving | Wait for DNS propagation (up to 48 hours), check Route 53 records |
| HTTPS certificate error | Ensure ACM certificate is in us-east-1 region |
| API calls fail from frontend | Check CORS in API Gateway, update `VITE_API_ENDPOINT` |
| High CloudFront costs | Switch to PriceClass_100, check data transfer logs |

---

## 📝 Quick Reference

```bash
# Environment variables to save
export FRONTEND_BUCKET="ido-web-frontend-xxx"
export DISTRIBUTION_ID="E123456789ABC"
export HOSTED_ZONE_ID="Z123456789ABC"
export CLOUDFRONT_DOMAIN="d123456.cloudfront.net"
export OAI_ID="E123456789ABC"

# Save to ~/.bashrc or script
echo "export FRONTEND_BUCKET=$FRONTEND_BUCKET" >> ~/.bashrc
source ~/.bashrc
```

---

## 🚀 Complete Deployment Flow

```
1. npm run build          # Create dist/ folder
2. Create S3 bucket       # Store static files
3. Setup CloudFront       # CDN distribution
4. Configure DNS          # Point domain to CloudFront
5. Test deployment        # Verify everything works
6. Setup auto-deploy      # Optional: deploy.sh script
```

**Time to deploy:** 15-30 minutes (plus DNS propagation)  
**Monthly cost:** $0-5 at low traffic  
**Total AWS cost:** ~$2-3/month (S3 + CloudFront + Route 53)

---

**Last Updated:** February 2026  
**Region:** us-east-1  
**Optimization Level:** Minimal Cost
