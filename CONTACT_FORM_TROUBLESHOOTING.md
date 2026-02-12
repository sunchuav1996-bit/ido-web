# Troubleshooting Contact Form Issues

## Error: "Contact service not configured" or "API not configured"

### ❌ Problem
```
Contact.tsx:98 Error submitting contact form: Error: API not configured
```

### ✅ Solution
The `.env.local` file is missing or `REACT_APP_API_BASE_URL` is not set.

**Steps:**
1. Create `.env.local` in your project root (same level as `package.json`)
2. Add this line (replace with your actual API URL):
   ```env
   REACT_APP_API_BASE_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com
   ```
3. Restart dev server: Press `Ctrl+C` and run `npm run dev`

---

## Error: "Network error" or Fetch Fails

### ❌ Problem
```
Error: Network error
```

### ✅ Solution
Check these in order:

**1. Is the API URL correct?**
- Open AWS Console → API Gateway → Your API → Stages
- Copy the **Invoke URL** exactly as shown
- It should look like: `https://a1b2c3d4e5.execute-api.us-east-1.amazonaws.com`
- Do NOT include `/contactMessage` or trailing `/`

**2. Is CORS enabled?**
- API Gateway console → Your API → CORS
- Should have `POST` method enabled
- Allowed origins should include `*` or your frontend URL

**3. Is the Lambda deployed?**
- Lambda console → `ido-saveContactMessage` function
- Should show "Last modified" timestamp recently
- Click **Deploy** if you made changes

**4. Test in Postman/Curl:**
```bash
curl -X POST https://xxxxx.execute-api.region.amazonaws.com/contactMessage \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "phone": "1234567890",
    "message": "Test message"
  }'
```

Expected response:
```json
{
  "success": true,
  "messageId": "msg_1707..."
}
```

---

## Error: "Failed to load resource: the server responded with a status of 400"

### ❌ Problem
API Gateway returns 400 Bad Request

### ✅ Solution

**1. Check request format**
- Ensure all fields are sent: `name`, `email`, `phone`, `message`
- All fields must be non-empty strings

**2. Check Lambda logs**
- CloudWatch → Log groups → `/aws/lambda/ido-saveContactMessage`
- Look for error messages and stack traces
- Common issues:
  - Missing environment variables (`CONTACT_MESSAGES_TABLE`)
  - DynamoDB table name mismatch

**3. Verify Lambda environment variables**
- Lambda console → `ido-saveContactMessage` → Configuration → Environment variables
- Should have: `CONTACT_MESSAGES_TABLE=ido-contact-messages`
- Redeploy after changes

---

## Error: "500 Internal Server Error"

### ❌ Problem
```
statusCode: 500,
body: { error: "Internal Server Error" }
```

### ✅ Solution

**1. Check DynamoDB permissions**
- IAM console → Roles → `ido-lambda-dynamodb-role`
- Should have policy: `ido-dynamodb-access`
- Policy should include `dynamodb:PutItem` action

**2. Check DynamoDB table setup**
- DynamoDB console → Tables → `ido-contact-messages`
- Status should be "Active"
- Partition key should be `messageId` (String)

**3. Check Lambda execution role**
- Lambda console → `ido-saveContactMessage` → Configuration
- Execution role should be `ido-lambda-dynamodb-role`
- If wrong, change it in the dropdown

**4. Review CloudWatch logs**
- Find the specific error message
- Common pattern: `UnrecognizedClientException` = wrong credentials/permissions

---

## Error: "Timeout waiting for Lambda response"

### ❌ Problem
Request hangs for >30s or times out

### ✅ Solution

**1. Increase Lambda timeout**
- Lambda console → `ido-saveContactMessage` → Configuration → General
- Change timeout from 3s to 30s (or higher)
- Click Save

**2. Check DynamoDB capacity**
- If using Provisioned billing: check write capacity
- If capacity exhausted, increase it
- On-demand billing doesn't have this issue

**3. Check CloudWatch logs**
- Look for slow operations or database locks
- If seeing repeated timeouts, might be API Gateway timeout (29s limit)

---

## Error: "CORS error" / "Cross-Origin Request Blocked"

### ❌ Problem
```
Access to XMLHttpRequest at 'https://...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

### ✅ Solution

**1. Enable CORS in API Gateway**
- API Gateway console → Your API → CORS
- Select `POST` method
- Set Access-Control-Allow-Origins to `*` (or your domain)
- Click Save

**2. Redeploy the API**
- Stages → your stage → click "Redeploy"
- Wait 1-2 minutes for changes to propagate

**3. Clear browser cache**
- Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- Clear cookies and cached data
- Refresh the page

---

## How to Debug Step by Step

### Step 1: Check Environment
```bash
# In your terminal, run:
grep REACT_APP_API_BASE_URL .env.local
```
Should print your API URL

### Step 2: Check Frontend is Using It
Open browser DevTools → Console → type:
```javascript
fetch('URL_HERE/contactMessage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test', email: 'test@example.com', phone: '1234567890', message: 'test'
  })
}).then(r => r.json()).then(d => console.log(d))
```

### Step 3: Check Lambda Logs
```bash
aws logs tail /aws/lambda/ido-saveContactMessage --follow
```

### Step 4: Check DynamoDB
```bash
aws dynamodb scan --table-name ido-contact-messages
```

---

## Working Example: Full Communication Flow

### Frontend (Contact.tsx)
```
User fills form → Click Submit 
  ↓
handleSubmit() called
  ↓
submitContactMessage({ name, email, phone, message })  
  ↓
fetch to REACT_APP_API_BASE_URL + '/contactMessage'
```

### Backend (API Gateway → Lambda → DynamoDB)
```
POST /contactMessage received
  ↓
Lambda handler triggered
  ↓
Validate all fields exist
  ↓
Generate messageId: 'msg_<timestamp>_<random>'
  ↓
Put to DynamoDB table: ido-contact-messages
  ↓
Return { success: true, messageId: '...' }
```

### Success Response
```json
{
  "statusCode": 200,
  "body": "{\"success\":true,\"messageId\":\"msg_1707123456789_abc123def\"}"
}
```

---

## Need More Help?

1. **Check the logs:**
   - `npm run dev` output in terminal
   - Browser console (F12)
   - CloudWatch logs in AWS

2. **Verify setup with checklist in AWS_CONTACT_SETUP.md**

3. **Test API directly with curl/Postman**

4. **Review AWS IAM permissions** - most common cause of 5XX errors
