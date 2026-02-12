# 🚀 Complete AWS Deployment Roadmap

Full-stack deployment of IDO Web on AWS with minimal cost (~$2-5/month).

---

## 📋 What You Get

✅ **Frontend:** React app hosted on S3 + CloudFront  
✅ **Backend:** Lambda functions + DynamoDB + API Gateway  
✅ **Domain:** Custom domain with HTTPS  
✅ **Cost:** $0 first 12 months (free tier), then $2-5/month  
✅ **Performance:** Global CDN, fast API responses  

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Your Users                        │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
        ┌──────────────────────────┐
        │   Route 53 DNS           │
        │   (your domain)          │
        └──────────────┬───────────┘
                       │
                       ↓
        ┌──────────────────────────┐
        │ CloudFront CDN           │
        │ (Static files cached)    │
        └──────────────┬───────────┘
                       │
         ┌─────────────┴──────────────┐
         │                            │
         ↓                            ↓
    ┌────────┐              ┌──────────────────┐
    │   S3   │              │ API Gateway      │
    │(React  │              │(api.example.com) │
    │build)  │              └────────┬─────────┘
    └────────┘                       │
                              ┌──────┴──────────┐
                              │                 │
                              ↓                 ↓
                        ┌──────────┐      ┌───────────┐
                        │  Lambda  │      │  Lambda   │
                        │Functions │      │ Functions │
                        └──────┬───┘      └─────┬─────┘
                               │                │
                        ┌──────┴────────────────┴─────┐
                        │                             │
                        ↓                             ↓
                  ┌──────────────┐         ┌──────────────┐
                  │   DynamoDB   │         │   S3 Bucket  │
                  │  (Database)  │         │ (Uploads)    │
                  └──────────────┘         └──────────────┘
```

---

## 📚 Complete Deployment Instructions

Follow these guides in order:

### **Phase 1: Backend Setup (30 min)**

📄 **[AWS_MINIMAL_COST_DEPLOY.md](AWS_MINIMAL_COST_DEPLOY.md)**

This includes:
- ✅ S3 bucket for file uploads
- ✅ DynamoDB tables (orders, contact messages)
- ✅ IAM roles & permissions
- ✅ Lambda functions deployment
- ✅ API Gateway setup

**Deliverable:** API endpoint URL (e.g., `https://api-id.execute-api.us-east-1.amazonaws.com`)

---

### **Phase 2: Frontend Deployment (20 min)**

📄 **[AWS_FRONTEND_DEPLOYMENT.md](AWS_FRONTEND_DEPLOYMENT.md)**

This includes:
- ✅ Build React app
- ✅ Create S3 bucket for static files
- ✅ Setup CloudFront CDN
- ✅ Configure custom domain with Route 53
- ✅ Enable HTTPS
- ✅ Setup continuous deployment

**Deliverable:** Live app at your custom domain (e.g., `https://example.com`)

---

### **Phase 3: Monitoring & Optimization (5 min)**

📄 **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**

Use for:
- ✅ Verify all services are working
- ✅ Test functionality end-to-end
- ✅ Monitor costs
- ✅ Security validation

---

## 🎬 Quick Start (TL;DR)

### **Minutes 0-5: Prerequisites**
```bash
# Verify everything is ready
aws sts get-caller-identity          # AWS CLI works
node --version                       # Node 20+
npm --version                        # npm installed
```

### **Minutes 5-35: Deploy Backend**
```bash
# Follow AWS_MINIMAL_COST_DEPLOY.md
# 1. Create S3 bucket (for uploads)
# 2. Create DynamoDB tables
# 3. Setup IAM role
# 4. Deploy Lambda functions
# 5. Create API Gateway
# Result: API endpoint URL
```

### **Minutes 35-55: Deploy Frontend**
```bash
# Follow AWS_FRONTEND_DEPLOYMENT.md
# 1. npm run build
# 2. Create S3 bucket (for static files)
# 3. Create CloudFront distribution
# 4. Setup Route 53 / DNS
# 5. Enable HTTPS
# Result: Live domain with app
```

### **Minutes 55-60: Verify**
```bash
# Use DEPLOYMENT_CHECKLIST.md
# Test all features end-to-end
# Monitor billing
```

**Total: ~1 hour to full deployment** ⏱️

---

## 🔑 Key Services & Costs

| Service | Purpose | Free Tier | Cost/Month After |
|---------|---------|-----------|------------------|
| **S3** (Frontend) | Static files (React build) | 5 GB | $0-1 |
| **S3** (Backend) | File uploads | Included | $0-1 |
| **CloudFront** | CDN delivery | 1 TB/month | $0.085/GB (~$1-5) |
| **DynamoDB** | Database | 25 GB | Pay-per-request |
| **Lambda** | Backend code | 1M calls/month | Free at low traffic |
| **API Gateway** | API endpoints | 1M calls/month | Free at low traffic |
| **Route 53** | DNS | - | $0.50 |
| **ACM** | SSL/TLS cert | Free | Free |
| **CloudWatch** | Monitoring | 5 GB logs | ~$0.50 |
| **Total (Year 1)** | Everything | **$0** | **~$2-5** |

---

## ✅ Deployment Checklist

### Prerequisites
- [ ] AWS account with free tier
- [ ] Custom domain ready
- [ ] AWS CLI installed & configured
- [ ] Node.js 20+ installed
- [ ] Backend deployment complete (if not, do Phase 1 first)

### Phase 1: Backend
- [ ] S3 bucket for uploads created
- [ ] DynamoDB tables created (orders, contact-messages)
- [ ] IAM role created with S3 & DynamoDB access
- [ ] Lambda functions deployed (presign, createOrder, saveContactMessage)
- [ ] API Gateway configured with routes
- [ ] API endpoint copied: `________________`

### Phase 2: Frontend
- [ ] React app built: `npm run build`
- [ ] Frontend S3 bucket created
- [ ] CloudFront distribution created
- [ ] Origin Access Identity (OAI) configured
- [ ] Route 53 DNS records created (A record + CNAME)
- [ ] ACM SSL certificate requested
- [ ] `.env.local` updated with API endpoint
- [ ] Files uploaded to S3
- [ ] CloudFront invalidation complete

### Phase 3: Verification
- [ ] App loads at https://example.com
- [ ] Contact form works
- [ ] Order creation works
- [ ] File uploads work
- [ ] API calls succeed
- [ ] No console errors
- [ ] Billing alerts set ($5 threshold)

---

## 📞 Support Resources

### Documentation Links
- [AWS_MINIMAL_COST_DEPLOY.md](AWS_MINIMAL_COST_DEPLOY.md) - Backend setup details
- [AWS_FRONTEND_DEPLOYMENT.md](AWS_FRONTEND_DEPLOYMENT.md) - Frontend deployment details
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Verification checklist
- [AWS_CONTACT_SETUP.md](AWS_CONTACT_SETUP.md) - Contact form Lambda setup
- [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md) - Original comprehensive guide

### CLI Commands Reference

**Check S3 buckets:**
```bash
aws s3 ls
aws s3 ls s3://bucket-name/
```

**Check Lambda functions:**
```bash
aws lambda list-functions --region us-east-1
aws logs tail /aws/lambda/ido-presign --follow
```

**Check DynamoDB:**
```bash
aws dynamodb list-tables --region us-east-1
aws dynamodb scan --table-name ido-orders --region us-east-1
```

**Check API Gateway:**
```bash
aws apigatewayv2 get-apis
aws apigatewayv2 get-stages --api-id <api-id>
```

**Check CloudFront:**
```bash
aws cloudfront list-distributions
aws cloudfront get-distribution --id <distribution-id>
```

**Check billing:**
```bash
aws ce get-cost-and-usage \
  --time-period Start=2024-02-01,End=2024-02-28 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

---

## 🔒 Security Checklist

- [ ] S3 buckets have Block Public Access enabled
- [ ] CloudFront uses OAI (not public S3)
- [ ] HTTPS enforced (no HTTP)
- [ ] ACM certificate installed
- [ ] No AWS credentials in code
- [ ] Environment variables in `.env.local` (not committed)
- [ ] API Gateway CORS configured for your domain only
- [ ] Lambda execution role has minimal permissions
- [ ] DynamoDB encryption enabled

---

## 💸 Cost Optimization Tips

1. **Use PriceClass_100** - Cheapest CloudFront regions (~50% savings)
2. **Delete old CloudFront logs** - Save ~$5-10/month
3. **Optimize images** - Reduce file sizes before upload
4. **Enable gzip** - Automatic in CloudFront (~70% compression)
5. **Avoid unnecessary invalidations** - 1,000/month free anyway
6. **Use on-demand DynamoDB** - No minimum, pay per request
7. **Keep everything in us-east-1** - Cheapest AWS region
8. **Monitor spending** - Check billing dashboard weekly

---

## 🚨 Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| **API calls fail (CORS error)** | Update CORS in API Gateway, match your domain |
| **Blank page on domain** | Check CloudFront cache invalidation, clear browser cache |
| **Old files still showing** | Invalidate CloudFront: `aws cloudfront create-invalidation --paths "/*"` |
| **404 errors on refresh** | Ensure index.html error document is set in S3 |
| **Domain not resolving** | Wait for DNS propagation (up to 48 hours) |
| **High CloudFront bills** | Check data transfer logs, consider PriceClass_100 |
| **Lambda timeout** | Increase timeout in Lambda settings |

---

## 📊 Expected Timeline

| Phase | Tasks | Time |
|-------|-------|------|
| **Setup** | Create AWS account, configure CLI | 10 min |
| **Backend** | S3, DynamoDB, Lambda, API Gateway | 30 min |
| **Frontend** | Build, S3, CloudFront, DNS | 20 min |
| **Testing** | Verify all features work | 10 min |
| **DNS Propagation** | Wait for domain to resolve | 5-30 min |
| **Total** | Complete deployment | **~75 min** |

---

## 🎯 Next Steps After Deployment

1. **Monitor Performance**
   - Check CloudFront metrics
   - Review Lambda logs
   - Monitor DynamoDB usage

2. **Setup Continuous Deployment**
   - Create `deploy.sh` script
   - Integrate with CI/CD (GitHub Actions, etc.)
   - Auto-deploy on code push

3. **Optimize Further**
   - Analyze bundle size
   - Implement code splitting
   - Setup automated backups

4. **Scale When Ready**
   - Add more Lambda functions
   - Setup DynamoDB replicas
   - Consider multi-region setup

---

## 📞 Getting Help

**For backend issues:**
→ See: [AWS_MINIMAL_COST_DEPLOY.md](AWS_MINIMAL_COST_DEPLOY.md)

**For frontend issues:**
→ See: [AWS_FRONTEND_DEPLOYMENT.md](AWS_FRONTEND_DEPLOYMENT.md)

**For verification:**
→ See: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

**For troubleshooting:**
→ Check the CLI commands reference above

---

## 📝 Environment Variables to Save

```bash
# Backend
export API_ENDPOINT="https://xxxxx.execute-api.us-east-1.amazonaws.com"
export S3_UPLOADS_BUCKET="ido-web-uploads-xxxxx"

# Frontend
export FRONTEND_BUCKET="ido-web-frontend-xxxxx"
export CLOUDFRONT_ID="EXXXXX"
export DOMAIN="example.com"
export ZONE_ID="ZXXXXX"

# Save to .env or ~/.bashrc
echo "export API_ENDPOINT=$API_ENDPOINT" >> ~/.bashrc
```

---

## 🎉 Success Criteria

✅ App loads at your custom domain  
✅ Contact form submits successfully  
✅ Orders can be created  
✅ Files upload to S3  
✅ Data stored in DynamoDB  
✅ HTTPS works (no warnings)  
✅ Monthly bill < $10  
✅ No console errors  

**You're deployed! 🚀**

---

**Created:** February 2026  
**Updated:** February 2026  
**Region:** us-east-1 (N. Virginia)  
**Estimated Total Cost (Year 1):** $0 free tier  
**Estimated Total Cost (Year 2+):** $24-60/year (~$2-5/month)
