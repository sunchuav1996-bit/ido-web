# 🚀 Deploy to GitHub Pages - 3 Commands!

Your app is ready to deploy! Everything is already configured.

---

## 📦 Step 1: Deploy to GitHub Pages (2 minutes)

```bash
# Deploy your app
npm run deploy
```

✅ That's it! Your site will be live at: `https://YOUR-USERNAME.github.io/ido-web/`

---

## 🔗 Step 2: Connect Your Domain `idoforyou.in` (5 minutes)

### A. Add Domain in GitHub

1. Go to: `https://github.com/YOUR-USERNAME/ido-web/settings/pages`
2. Under "Custom domain", type: **idoforyou.in**
3. Click **Save**
4. Wait 30 seconds, then check **Enforce HTTPS**

### B. Update Your Domain's DNS Records

Go to your domain provider (where you bought idoforyou.in) and add these records:

**For Root Domain (idoforyou.in):**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |

**For WWW Subdomain:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | YOUR-USERNAME.github.io | 3600 |

**Replace `YOUR-USERNAME` with your actual GitHub username!**

### C. Wait and Test

```bash
# Check DNS (wait 5-30 minutes after adding records)
dig idoforyou.in +short

# Should show GitHub IPs like: 185.199.108.153
```

Visit **https://idoforyou.in** - Your site is LIVE! 🎉

---

## 🔄 Step 3: Auto-Deploy on Every Push (Optional - 2 minutes)

Create GitHub Actions workflow for automatic deployment:

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
      
      - run: npm ci
      - run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: idoforyou.in
EOF

git add .github/workflows/deploy.yml
git commit -m "Add auto-deploy workflow"
git push origin main
```

Now every time you push code, it auto-deploys! ✨

---

## ✅ Checklist

- [ ] Run `npm run deploy`
- [ ] Site loads at `https://YOUR-USERNAME.github.io/ido-web/`
- [ ] Add custom domain in GitHub Settings
- [ ] Add 4 A records to DNS
- [ ] Add CNAME record for www
- [ ] Wait 5-30 minutes
- [ ] Visit https://idoforyou.in
- [ ] Verify HTTPS works (green padlock)
- [ ] Test contact form
- [ ] Test order creation

---

## 🆘 Issues?

**Site shows 404?** Wait 2-3 minutes after deploying.

**Custom domain not working?** 
```bash
# Check DNS
dig idoforyou.in +short
# Should show: 185.199.108.153, etc.
```

**Old content showing?**
```bash
# Clear cache and redeploy
npm run deploy
# Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

---

## 💰 Cost: $0/month!

✅ Free hosting forever on GitHub Pages  
✅ Free HTTPS  
✅ Free CDN  

**Total monthly cost: $0** 🎉

---

Ready? Run this now:

```bash
npm run deploy
```
