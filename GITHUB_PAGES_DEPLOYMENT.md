# 🎉 Deploy React App to GitHub Pages (100% FREE!)

Deploy your React app using GitHub Pages with your custom domain - **completely free, no AWS costs for frontend!**

---

## 💰 Cost Comparison

| Service | GitHub Pages | AWS S3+CloudFront |
|---------|--------------|-------------------|
| **Frontend Hosting** | **FREE** ✅ | $2-5/month |
| **Custom Domain** | **FREE** ✅ | Route 53: $0.50/month |
| **HTTPS** | **FREE** ✅ | ACM: Free (but need CloudFront) |
| **CDN** | **FREE** ✅ | $1-5/month |
| **Storage** | **FREE** (1GB) | $0.023/GB |
| **Bandwidth** | **FREE** (100GB/month) | $0.085/GB |
| **Total** | **$0/month** 🎉 | $3-10/month |

**Backend (Lambda, DynamoDB, API Gateway):** Still use AWS (covered by free tier, ~$0-2/month)

---

## 📋 Prerequisites

✅ GitHub account (free)  
✅ Domain name registered (you already have this)  
✅ Git installed on your computer  
✅ Node.js 20+ installed  
✅ AWS backend deployed (see AWS_MINIMAL_COST_DEPLOY.md)  

---

## 🚀 Step 1: Prepare Your Repository

### Option A: New Repository

```bash
# Navigate to your project
cd /Users/anandsunchu/Documents/studio\ code/ido-web

# Initialize git (if not already)
git init

# Create .gitignore (if not exists)
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Lambda deployment packages
lambda/**/*.zip
EOF

# Add all files
git add .

# First commit
git commit -m "Initial commit - IDO Web Application"

# Create GitHub repo via CLI (or use GitHub website)
# Install GitHub CLI: brew install gh
gh auth login
gh repo create ido-web --public --source=. --remote=origin --push
```

### Option B: Existing Repository

```bash
# Just make sure you're up to date
cd /Users/anandsunchu/Documents/studio\ code/ido-web
git add .
git commit -m "Prepare for GitHub Pages deployment"
git push origin main
```

---

## 🔧 Step 2: Configure Vite for GitHub Pages

### Update `vite.config.ts`

```bash
# Edit vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Keep as '/' if using custom domain
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
EOF
```

### Update `package.json` with deployment scripts

Add these scripts to your `package.json`:

```bash
npm install --save-dev gh-pages
```

Then update the scripts section:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

---

## 🌐 Step 3: Configure Environment Variables for Production

Create a production environment file:

```bash
# Create .env.production
cat > .env.production << 'EOF'
VITE_API_ENDPOINT=https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com
VITE_S3_BUCKET=ido-web-uploads-xxxxx
VITE_AWS_REGION=us-east-1
VITE_APP_URL=https://yourdomain.com
EOF
```

**Replace with your actual values:**
- `YOUR-API-ID`: Your API Gateway ID from AWS backend deployment
- `ido-web-uploads-xxxxx`: Your S3 bucket name
- `yourdomain.com`: Your actual domain

---

## 🎯 Step 4: Build and Test Locally

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview

# Test at http://localhost:4173
# Verify everything works before deploying
```

---

## 📤 Step 5: Deploy to GitHub Pages

### Manual Deployment

```bash
# Deploy to GitHub Pages
npm run deploy

# This will:
# 1. Build your app
# 2. Create/update 'gh-pages' branch
# 3. Push to GitHub
# 4. Your site will be live in 1-2 minutes
```

### Verify Deployment

1. Go to your GitHub repo: `https://github.com/YOUR-USERNAME/ido-web`
2. Click **Settings** → **Pages**
3. You should see: "Your site is live at `https://YOUR-USERNAME.github.io/ido-web/`"

---

## 🔗 Step 6: Configure Custom Domain

### Part A: Add Custom Domain in GitHub

1. Go to GitHub repo → **Settings** → **Pages**
2. Under **Custom domain**, enter: `yourdomain.com`
3. Click **Save**
4. Check **Enforce HTTPS** (wait a few minutes for certificate)

This creates a `CNAME` file in your `gh-pages` branch.

### Part B: Update DNS Records at Your Domain Provider

**For Root Domain (example.com):**

Go to your domain registrar (GoDaddy, Namecheap, etc.) and add these DNS records:

```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

**For WWW Subdomain (www.example.com):**

```
Type: CNAME
Name: www
Value: YOUR-USERNAME.github.io
```

### Popular Domain Providers Setup

**GoDaddy:**
1. Go to DNS Management
2. Add 4 A records pointing to GitHub IPs above
3. Add CNAME for www

**Namecheap:**
1. Advanced DNS
2. Add A records (@ host)
3. Add CNAME record (www host)

**Cloudflare:**
1. DNS → Add Record
2. Add A records (Proxy status: DNS only)
3. Add CNAME for www

**Google Domains:**
1. DNS → Custom records
2. Add A records
3. Add CNAME for www

### Verify DNS Propagation

```bash
# Check if DNS is updated (may take 5-60 minutes)
dig yourdomain.com +short
# Should show GitHub IPs: 185.199.108.153, etc.

# Check CNAME
dig www.yourdomain.com +short
# Should show: YOUR-USERNAME.github.io
```

---

## 🔄 Step 7: Setup Automatic Deployment with GitHub Actions

Create automated deployment on every push to main branch:

```bash
# Create GitHub Actions workflow directory
mkdir -p .github/workflows

# Create deployment workflow
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main  # Deploy on push to main branch
  workflow_dispatch:  # Allow manual trigger

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_ENDPOINT: ${{ secrets.VITE_API_ENDPOINT }}
          VITE_S3_BUCKET: ${{ secrets.VITE_S3_BUCKET }}
          VITE_AWS_REGION: ${{ secrets.VITE_AWS_REGION }}
          VITE_APP_URL: ${{ secrets.VITE_APP_URL }}
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: yourdomain.com  # Replace with your domain
EOF
```

### Add Environment Secrets to GitHub

1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:
   - `VITE_API_ENDPOINT`: Your API Gateway URL
   - `VITE_S3_BUCKET`: Your S3 bucket name
   - `VITE_AWS_REGION`: `us-east-1`
   - `VITE_APP_URL`: Your domain URL

### Test Automatic Deployment

```bash
# Make a change
git add .
git commit -m "Test automatic deployment"
git push origin main

# Check Actions tab on GitHub to see deployment progress
# Your site will be updated in 2-3 minutes
```

---

## 🎨 Step 8: Create Custom 404 Page (Optional)

For SPA routing to work properly:

```bash
# Create 404.html that redirects to index.html
cat > public/404.html << 'EOF'
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>IDO - Loading...</title>
    <script>
      // Redirect to index.html with path as query parameter
      sessionStorage.redirect = location.href;
    </script>
    <meta http-equiv="refresh" content="0;URL='/'">
  </head>
  <body>
    Loading...
  </body>
</html>
EOF

# Update index.html to handle redirects (add to <head>)
# This will be injected during build
```

Then update your `index.html` to include:

```html
<script>
  // Handle redirect from 404.html
  (function(){
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect != location.href) {
      history.replaceState(null, null, redirect);
    }
  })();
</script>
```

---

## ✅ Complete Deployment Checklist

### Pre-Deployment
- [ ] GitHub account created
- [ ] Repository created/initialized
- [ ] Domain name ready
- [ ] AWS backend deployed (API Gateway, Lambda, DynamoDB)
- [ ] `.env.production` configured with API endpoints

### Deployment
- [ ] `gh-pages` package installed
- [ ] `vite.config.ts` updated
- [ ] `package.json` scripts added
- [ ] Production build tested locally
- [ ] Deployed to GitHub Pages: `npm run deploy`
- [ ] Site accessible at `https://USERNAME.github.io/REPO/`

### Custom Domain
- [ ] Custom domain added in GitHub Settings
- [ ] DNS A records added (4 GitHub IPs)
- [ ] DNS CNAME record added (www subdomain)
- [ ] DNS propagation verified
- [ ] HTTPS enforced in GitHub Settings
- [ ] Site accessible at `https://yourdomain.com`

### Automation
- [ ] GitHub Actions workflow created
- [ ] Environment secrets added in GitHub
- [ ] Automatic deployment tested
- [ ] Site updates on push to main

### Testing
- [ ] App loads at custom domain
- [ ] Contact form works
- [ ] Order creation works
- [ ] File uploads work
- [ ] API calls succeed
- [ ] HTTPS works (green padlock)
- [ ] No console errors

---

## 🔧 Troubleshooting

### Issue: Site shows 404

**Solution:**
```bash
# Ensure gh-pages branch exists
git branch -a

# Check GitHub Pages settings
# Repo → Settings → Pages → Source should be "gh-pages" branch
```

### Issue: Custom domain not working

**Solution:**
```bash
# Check DNS propagation
dig yourdomain.com +short

# Wait 5-60 minutes for DNS to propagate
# Clear browser cache
# Try incognito/private mode
```

### Issue: HTTPS not working

**Solution:**
- Wait 5-10 minutes after adding custom domain
- Uncheck and re-check "Enforce HTTPS" in GitHub Settings
- Ensure DNS is properly configured

### Issue: API calls failing (CORS error)

**Solution:**
```bash
# Update CORS in API Gateway to allow your domain
# Add: https://yourdomain.com
# Also ensure .env.production has correct API endpoint
```

### Issue: Blank page after deployment

**Solution:**
```bash
# Check browser console for errors
# Verify vite.config.ts has base: '/'
# Ensure all environment variables are set in GitHub Secrets
# Rebuild and redeploy: npm run deploy
```

### Issue: Old content showing after update

**Solution:**
```bash
# Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
# Wait 2-3 minutes for GitHub Pages to update
# Check if GitHub Actions workflow completed successfully
```

---

## 🚀 Quick Deploy Script

Save this as `deploy.sh` in your project root:

```bash
#!/bin/bash
set -e

echo "🔨 Building React app..."
npm run build

echo "📤 Deploying to GitHub Pages..."
npm run deploy

echo "✅ Deployment complete!"
echo "🌐 Your site will be live in 2-3 minutes at:"
echo "   https://yourdomain.com"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📊 GitHub Pages Limits

| Resource | Limit | Your App |
|----------|-------|----------|
| **Repository size** | 1 GB | ~50 MB ✅ |
| **Published site size** | 1 GB | ~5 MB ✅ |
| **Bandwidth** | 100 GB/month | Plenty for low-medium traffic ✅ |
| **Builds per hour** | 10 | More than enough ✅ |

**All FREE forever!** 🎉

---

## 🔒 Security Best Practices

- [ ] Never commit `.env` or `.env.local` files
- [ ] Use GitHub Secrets for sensitive data
- [ ] Keep backend API endpoints in environment variables
- [ ] Enable "Enforce HTTPS" in GitHub Pages settings
- [ ] Regularly update dependencies: `npm update`

---

## 📈 Performance Optimization

### Optimize Build Size

```bash
# Analyze bundle size
npm run build
du -sh dist/

# Check what's in your bundle
npm install --save-dev vite-plugin-visualizer
```

Add to `vite.config.ts`:
```typescript
import { visualizer } from 'vite-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ],
});
```

### Enable Compression

GitHub Pages automatically serves gzip compressed files.

### Image Optimization

```bash
# Before uploading images, compress them
# Use tools like: tinypng.com, imageoptim.com
# Or optimize in code:
npm install sharp
```

---

## 🎯 Complete Workflow

### Daily Development
```bash
# 1. Make changes to code
git add .
git commit -m "Feature: Add new functionality"

# 2. Push to GitHub (triggers automatic deployment)
git push origin main

# 3. Wait 2-3 minutes, changes are live! 🎉
```

### Manual Deployment
```bash
# If you prefer manual control
npm run deploy
```

---

## 💰 Final Cost Summary

| Component | Service | Cost |
|-----------|---------|------|
| **Frontend Hosting** | GitHub Pages | **FREE** ✅ |
| **Domain** | Your registrar | $10-15/year (you already have) |
| **HTTPS Certificate** | GitHub (Let's Encrypt) | **FREE** ✅ |
| **CDN** | GitHub Pages | **FREE** ✅ |
| **Backend API** | AWS Lambda | **FREE** (1M/month) ✅ |
| **Database** | AWS DynamoDB | **FREE** (25GB) ✅ |
| **File Storage** | AWS S3 | **FREE** (5GB) ✅ |
| **TOTAL MONTHLY** | - | **$0** 🎉 |
| **TOTAL YEARLY** | - | **$10-15** (domain only) |

**vs AWS S3+CloudFront:** Saves $36-120/year! 💸

---

## 📞 Support

### Useful Links
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Custom Domain Setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub Actions](https://docs.github.com/en/actions)

### Check Deployment Status
```bash
# On GitHub: Actions tab shows deployment progress
# Or via CLI:
gh run list --workflow=deploy.yml
gh run view --log
```

---

## 🎉 Success!

Your React app is now:
- ✅ Hosted on GitHub Pages (FREE)
- ✅ Using custom domain with HTTPS
- ✅ Auto-deployed on every push
- ✅ Backed by AWS serverless (also FREE tier)
- ✅ Costing $0/month (vs $3-10 on AWS)

**You're live at https://yourdomain.com! 🚀**

---

**Last Updated:** February 2026  
**Hosting:** GitHub Pages  
**Monthly Cost:** $0  
**Deployment Time:** ~15 minutes
