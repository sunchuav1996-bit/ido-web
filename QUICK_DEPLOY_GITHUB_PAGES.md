# ⚡ GitHub Pages Quick Deploy (5 Minutes)

**FREE hosting for your React app with custom domain!**

---

## 🎯 What You'll Get

✅ FREE hosting forever  
✅ Your custom domain with HTTPS  
✅ Auto-deploy on every code push  
✅ Live in 5-10 minutes  

---

## 📝 Before You Start

- [ ] GitHub account
- [ ] Your domain name and access to DNS settings
- [ ] Backend already deployed on AWS (API Gateway URL ready)

---

## 🚀 Deploy in 5 Steps

### Step 1: Install GitHub Pages Package (30 seconds)

```bash
cd /Users/anandsunchu/Documents/studio\ code/ido-web
npm install --save-dev gh-pages
```

### Step 2: Add Deploy Script (1 minute)

Open `package.json` and add to the `"scripts"` section:

```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

Your scripts should look like:
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

### Step 3: Create Production Environment File (1 minute)

```bash
cat > .env.production << 'EOF'
VITE_API_ENDPOINT=https://YOUR-API-GATEWAY-ID.execute-api.us-east-1.amazonaws.com
VITE_S3_BUCKET=your-s3-bucket-name
VITE_AWS_REGION=us-east-1
VITE_APP_URL=https://yourdomain.com
EOF
```

**Edit `.env.production` and replace:**
- `YOUR-API-GATEWAY-ID` with your actual API Gateway ID
- `your-s3-bucket-name` with your S3 bucket name
- `yourdomain.com` with your actual domain

### Step 4: Push to GitHub (2 minutes)

```bash
# Create repository on GitHub (if not exists)
gh auth login  # Login to GitHub CLI
gh repo create ido-web --public --source=. --remote=origin

# Or if repo exists, just push
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

### Step 5: Deploy! (30 seconds)

```bash
npm run deploy
```

**Done!** Your site is now at: `https://YOUR-USERNAME.github.io/ido-web/`

---

## 🔗 Connect Your Custom Domain (5 minutes)

### Part A: Add Domain in GitHub (1 minute)

1. Go to: `https://github.com/YOUR-USERNAME/ido-web/settings/pages`
2. Under "Custom domain", enter: `yourdomain.com`
3. Click **Save**
4. Check **Enforce HTTPS** (after DNS is configured)

### Part B: Configure DNS at Your Domain Provider (3 minutes)

**Log into your domain registrar** (GoDaddy, Namecheap, etc.) and add these records:

#### For Root Domain (example.com):

| Type | Name | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

#### For WWW Subdomain:

| Type | Name | Value |
|------|------|-------|
| CNAME | www | YOUR-USERNAME.github.io |

**Save** and wait 5-30 minutes for DNS propagation.

### Part C: Verify (1 minute)

```bash
# Check if DNS is updated
dig yourdomain.com +short

# Should show GitHub IPs
```

Visit `https://yourdomain.com` - Your site is LIVE! 🎉

---

## 🔄 Setup Auto-Deploy (Optional - 3 minutes)

Never manually deploy again! Auto-deploy on every push:

### Create GitHub Actions Workflow

```bash
mkdir -p .github/workflows
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_ENDPOINT: ${{ secrets.VITE_API_ENDPOINT }}
          VITE_S3_BUCKET: ${{ secrets.VITE_S3_BUCKET }}
          VITE_AWS_REGION: us-east-1
          VITE_APP_URL: ${{ secrets.VITE_APP_URL }}
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: yourdomain.com
EOF
```

**Replace `yourdomain.com` with your actual domain!**

### Add Secrets to GitHub

1. Go to: `https://github.com/YOUR-USERNAME/ido-web/settings/secrets/actions`
2. Click **New repository secret**
3. Add these (one by one):

| Name | Value |
|------|-------|
| VITE_API_ENDPOINT | Your API Gateway URL |
| VITE_S3_BUCKET | Your S3 bucket name |
| VITE_APP_URL | https://yourdomain.com |

### Test It

```bash
git add .
git commit -m "Add auto-deploy"
git push origin main
```

Check the **Actions** tab on GitHub - deployment will run automatically! ✨

---

## ✅ Final Checklist

- [ ] `npm run deploy` completed successfully
- [ ] Site loads at `https://YOUR-USERNAME.github.io/ido-web/`
- [ ] Custom domain added in GitHub Settings
- [ ] 4 A records added to DNS
- [ ] CNAME record added to DNS
- [ ] Site loads at `https://yourdomain.com` (wait 5-30 min)
- [ ] HTTPS enforced (green padlock)
- [ ] Contact form works
- [ ] Order creation works
- [ ] GitHub Actions workflow added (optional)

---

## 🎉 You're Done!

**Your React app is now:**
- ✅ Hosted FREE forever on GitHub Pages
- ✅ Using your custom domain with HTTPS
- ✅ Auto-deployed on every push (if GitHub Actions setup)
- ✅ Costing $0/month!

**Live at:** https://yourdomain.com 🚀

---

## 🆘 Quick Fixes

**Site shows 404?**
```bash
# Make sure gh-pages branch exists
git branch -a
```

**Domain not working?**
```bash
# Check DNS (wait 5-30 minutes after adding records)
dig yourdomain.com +short
```

**API calls failing?**
```bash
# Verify .env.production has correct values
cat .env.production
# Rebuild and redeploy
npm run deploy
```

**Need help?**
See full guide: [GITHUB_PAGES_DEPLOYMENT.md](GITHUB_PAGES_DEPLOYMENT.md)

---

**Time to deploy:** 5 minutes  
**Monthly cost:** $0  
**Domain cost:** $10-15/year (you already have)  
**Total savings vs AWS:** $36-120/year! 💰
