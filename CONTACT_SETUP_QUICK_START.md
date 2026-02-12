# Contact Form Setup - Quick Start (3 Steps)

## Current Error
```
Error: API not configured
```

You're getting this because **`.env.local` is missing** or incomplete. Here's how to fix it:

---

## Solution: Add `.env.local`

### Step 1: Create `.env.local` file

In your project root (same folder as `package.json`), create a new file called `.env.local`

### Step 2: Add API Configuration

Copy & paste this into `.env.local`:

```env
REACT_APP_API_BASE_URL=https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com
REACT_APP_AWS_REGION=YOUR_REGION
REACT_APP_CONTACT_MESSAGES_TABLE=ido-contact-messages
```

### Step 3: Replace Placeholders

1. **Get your API ID and Region from AWS:**
   - Open AWS Console
   - Go to API Gateway → Your API → Stages
   - Find the **Invoke URL** (looks like `https://a1b2c3d4e5.execute-api.ap-south-1.amazonaws.com`)

2. **Extract and replace in `.env.local`:**
   - `YOUR_API_ID` = `a1b2c3d4e5` (from Invoke URL)
   - `YOUR_REGION` = `ap-south-1` (from Invoke URL)

3. **Example for Asia (Mumbai - most common for India):**
   ```env
   REACT_APP_API_BASE_URL=https://a1b2c3d4e5.execute-api.ap-south-1.amazonaws.com
   REACT_APP_AWS_REGION=ap-south-1
   REACT_APP_CONTACT_MESSAGES_TABLE=ido-contact-messages
   ```

4. **Save the file**

---

## Step 4: Restart Development Server

Stop your development server (press `Ctrl+C`) and restart it:

```bash
npm run dev
```

---

## Step 5: Test It

1. Go to Contact page in your browser
2. Fill out the form
3. Click "Send Message"
4. You should see: **"Message Sent!"**

---

## Verify in AWS

To confirm the message was saved:

1. Open AWS Console
2. Go to **DynamoDB** → **Tables** → **ido-contact-messages**
3. Click **Explore table items**
4. You should see your test message with:
   - `messageId`: Auto-generated ID
   - `name`, `email`, `phone`, `message`: Your form data
   - `createdAt`: ISO timestamp
   - `status`: "new"

✅ You're done!

---

## If It Still Doesn't Work

Check the [CONTACT_FORM_TROUBLESHOOTING.md](CONTACT_FORM_TROUBLESHOOTING.md) guide for common errors and solutions.

---

## Architecture Overview

```
Your Browser
    ↓
Contact Form (Contact.tsx)
    ↓
API Service (apiService.ts)
    ↓
API Gateway (AWS)
    ↓
Lambda Function (ido-saveContactMessage)
    ↓
DynamoDB Table (ido-contact-messages)
```

**Key Points:**
✅ No AWS credentials exposed in browser  
✅ All calls go through secure API Gateway  
✅ Lambda handles database operations  
✅ Messages stored permanently in DynamoDB
