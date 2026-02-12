## AWS Contact Message Setup

This guide explains how to deploy the contact message pipeline end-to-end using DynamoDB, Lambda, and API Gateway so that the frontend can call `/contactMessage` with a POST request.

### Architecture

1. **API Gateway** exposes `POST /contactMessage`.
2. **Lambda (`ido-saveContactMessage`)** validates the payload and writes to DynamoDB.
3. **DynamoDB (`ido-contact-messages`)** stores the submitted messages.

### Prerequisites

- AWS account with permission to manage DynamoDB, Lambda, API Gateway, and IAM.
- Node.js 18+ installed locally (for building/testing Lambda code if needed).
- Access to your project workspace to update environment variables.

---

## 1. Create DynamoDB Table

1. Open the [DynamoDB Console](https://console.aws.amazon.com/dynamodbv2/).
2. Click **Create table** and configure:
	 - **Table name:** `ido-contact-messages`
	 - **Partition key:** `messageId` (String)
	 - **Billing mode:** On-demand (or provisioned if you prefer)
	 - Leave other settings default unless you need PITR/backups.
3. Create the table and wait until the status becomes **Active**.

---

## 2. Create the Lambda Function

1. Go to the [Lambda Console](https://console.aws.amazon.com/lambda/), click **Create function** → **Author from scratch**.
2. Settings:
	 - **Function name:** `ido-saveContactMessage`
	 - **Runtime:** Node.js 18.x
	 - **Architecture:** x86_64
	 - **Execution role:** Create a new role with basic Lambda permissions (name it `ido-lambda-dynamodb-role`).
3. After the function is created, open the **Code** tab and replace the source with the code from `lambda/saveContactMessage/index.ts` in this repo.
4. In **Configuration → Environment variables**, add:
	 - `CONTACT_MESSAGES_TABLE=ido-contact-messages`
	 - `AWS_REGION=<your-region>` (for example `ap-south-1` or `us-east-1`)
5. Click **Deploy** to publish the latest code.

---

## 3. Grant DynamoDB Access via IAM

1. Open [IAM Console](https://console.aws.amazon.com/iam/) → **Roles** → select `ido-lambda-dynamodb-role`.
2. Click **Add permissions** → **Create inline policy** → use JSON editor.
3. Paste:

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"dynamodb:PutItem",
				"dynamodb:GetItem",
				"dynamodb:UpdateItem",
				"dynamodb:Query"
			],
			"Resource": "arn:aws:dynamodb:*:*:table/ido-contact-messages"
		}
	]
}
```

4. Name the policy `ido-dynamodb-access` and create it.

---

## 4. Create API Gateway Endpoint (`POST /contactMessage`)

1. Open the [API Gateway Console](https://console.aws.amazon.com/apigateway/) and choose **HTTP API** (or REST if you need advanced features). Below assumes HTTP API.
2. Click **Create API** → **Build** under HTTP API.
3. **Configure routes:**
	 - **Method:** `POST`
	 - **Resource path:** `/contactMessage`
4. **Integrations:**
	 - Choose **Lambda** integration.
	 - Select the Lambda function `ido-saveContactMessage`.
	 - Grant the permission prompt so API Gateway can invoke Lambda.
5. **CORS:** Enable for `POST` and optionally `OPTIONS` so the browser can call it from the frontend domain.
6. Click **Next** → **Create** to finalize the API.

### Stage and Invoke URL

1. After creation, API Gateway automatically makes a default stage (for HTTP APIs). Copy the **Invoke URL** from the **Stages** tab.
2. The final endpoint will look like: `https://<api-id>.execute-api.<region>.amazonaws.com/contactMessage`.

### Test Method Execution

1. In API Gateway, navigate to **Routes** → select `POST /contactMessage` → **Test**.
2. Use a JSON body:

```json
{
	"name": "Test User",
	"email": "test@example.com",
	"phone": "9876543210",
	"message": "API Gateway test call"
}
```

3. Click **Send**. A successful call returns status **200** with `{ "success": true, "messageId": "msg_..." }`.
4. Check DynamoDB → `ido-contact-messages` → **Explore table items** to confirm the record is stored.

---

## 5. Update Frontend Environment

Add the API base URL to your `.env.local` file (never commit this file):

```env
# API Gateway base URL (without trailing slash)
# Replace xxxxx with your API ID and region with your AWS region
REACT_APP_API_BASE_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com

# AWS configuration (for S3 uploads if needed)
REACT_APP_AWS_REGION=us-east-1
REACT_APP_CONTACT_MESSAGES_TABLE=ido-contact-messages
```

**Important:**
- Copy your **Invoke URL** from API Gateway Stages (should look like `https://xxxxx.execute-api.region.amazonaws.com`)
- Do NOT include `/contactMessage` in the URL - the frontend adds this automatically
- Replace `xxxxx` with your actual API ID
- Replace `us-east-1` with your region
- Restart `npm run dev` after updating `.env.local`

**Migration from Direct DynamoDB:**
- You NO LONGER need AWS credentials (`REACT_APP_AWS_ACCESS_KEY_ID`, `REACT_APP_AWS_SECRET_ACCESS_KEY`) in the browser
- These credentials were insecure and have been removed
- All communication now goes through API Gateway → Lambda (secure and scalable)

---

## 6. Frontend Implementation (Already Done ✓)

The Contact page is already configured to use the API service:

**Contact.tsx:**
```tsx
import { submitContactMessage } from '../services/apiService';

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  // Call API Gateway → Lambda → DynamoDB
  const result = await submitContactMessage({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    message: formData.message
  });
  
  if (result.success) {
    // Show success to user
  }
};
```

**apiService.ts:**
```ts
export const submitContactMessage = async (payload: ContactMessageRequest) => {
  // Calls ${API_BASE}/contactMessage
  // API_BASE is from REACT_APP_API_BASE_URL env var
  const resp = await fetch(`${API_BASE}/contactMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  return resp.json();
};
```

**No AWS SDK calls from browser anymore!** ✓
- Before: Direct DynamoDB calls with exposed credentials (❌ insecure)
- Now: API Gateway → Lambda → DynamoDB (✅ secure and scalable)

---

## 7. Monitoring

- **CloudWatch Logs:** Navigate to CloudWatch → Log groups → `/aws/lambda/ido-saveContactMessage` to see request/response logs.
- **API Gateway Metrics:** In API Gateway → your API → **Metrics** tab to watch 4XX/5XX rates and latency.
- **DynamoDB Items:** Periodically review items in `ido-contact-messages` and archive/clean as needed.

---

## 8. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `403` from API Gateway | No invoke permission | Re-save Lambda integration so API Gateway adds the permission statement. |
| `500` responses | Lambda error | Check CloudWatch logs for stack traces, confirm env vars. |
| CORS errors in browser | CORS not enabled on API | Edit API Gateway → CORS → enable for POST + OPTIONS and redeploy. |
| Items missing in DynamoDB | Wrong table name or region | Verify Lambda env vars and IAM policy resource ARN. |

---

## 9. Next Enhancements

1. Add SNS/email notifications when new messages arrive.
2. Build an admin dashboard to read/mark messages.
3. Add request validation using API Gateway schemas.
4. Implement throttling/recaptcha to prevent spam.

With these steps, `/contactMessage` POST requests will flow through API Gateway → Lambda → DynamoDB reliably.

---

## Setup Checklist

### Phase 1: AWS Infrastructure ✓
- [ ] Create DynamoDB table: `ido-contact-messages`
- [ ] Create Lambda function: `ido-saveContactMessage`
- [ ] Grant Lambda IAM permissions for DynamoDB
- [ ] Create API Gateway HTTP API
- [ ] Create POST `/contactMessage` route
- [ ] Enable CORS on API Gateway
- [ ] Deploy Lambda and API Gateway
- [ ] Copy API invoke URL

### Phase 2: Frontend Configuration
- [ ] Create `.env.local` in project root
- [ ] Add `REACT_APP_API_BASE_URL=https://xxxxx.execute-api.region.amazonaws.com`
- [ ] Restart `npm run dev`
- [ ] Test Contact form in browser

### Phase 3: Verification
- [ ] Contact form submits without errors
- [ ] Message appears in DynamoDB table
- [ ] Check CloudWatch logs for Lambda execution
- [ ] Verify response time and error handling

---

## Quick Start: .env.local Template

1. Open/create `.env.local` in your project root directory
2. Add these lines:

```env
REACT_APP_API_BASE_URL=https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com
REACT_APP_AWS_REGION=YOUR_REGION
REACT_APP_CONTACT_MESSAGES_TABLE=ido-contact-messages
```

3. Replace placeholders:
   - `YOUR_API_ID`: From API Gateway Stages → Invoke URL (extract the part between `https://` and `.execute-api`)
   - `YOUR_REGION`: Your AWS region (e.g., `us-east-1`, `ap-south-1`, `eu-west-1`)

4. Example (after replacement):
```env
REACT_APP_API_BASE_URL=https://a1b2c3d4e5.execute-api.ap-south-1.amazonaws.com
REACT_APP_AWS_REGION=ap-south-1
REACT_APP_CONTACT_MESSAGES_TABLE=ido-contact-messages
```

5. Save and restart dev server: `npm run dev`
