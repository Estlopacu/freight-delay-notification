# Quick SendGrid Setup - Fix 403 Forbidden Error

## Current Issue

You're getting a **403 Forbidden** error, which means one of these issues:
1. ❌ API key is invalid/expired
2. ❌ API key doesn't have correct permissions
3. ❌ Sender email (`estlopacu@gmail.com`) is not verified

## Quick Fix (5 minutes)

### Step 1: Verify Your Sender Email

1. **Go to SendGrid Sender Verification**:
   ```
   https://app.sendgrid.com/settings/sender_auth/senders
   ```

2. **Check if `estlopacu@gmail.com` is verified**:
   - Look for a green checkmark ✅ next to your email
   - If not verified or not in the list, continue to step 3

3. **Add/Verify Your Email**:
   - Click **"Create New Sender"** or **"Verify Single Sender"**
   - Fill in the form:
     ```
     From Name: Esteban
     From Email Address: estlopacu@gmail.com
     Reply To: estlopacu@gmail.com
     Company Address: Your address
     City: Your city
     Country: Your country
     ```
   - Click **"Create"**
   - Check your Gmail inbox for verification email
   - Click the verification link in the email

### Step 2: Create a New API Key

Your current API key may be expired or have wrong permissions.

1. **Go to API Keys Settings**:
   ```
   https://app.sendgrid.com/settings/api_keys
   ```

2. **Create New API Key**:
   - Click **"Create API Key"**
   - Name it: `Freight Delay Notifications`
   - Permission Level: Select **"Full Access"** (recommended) or **"Restricted Access"**
   - If Restricted Access, enable: **Mail Send** → **Full Access**
   - Click **"Create & View"**

3. **IMPORTANT - Copy the API Key**:
   - The key will look like: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Copy it immediately** - you won't see it again!
   - It should start with `SG.`

### Step 3: Update Your .env File

Replace the old API key with the new one:

```bash
# Open .env file and update:
SENDGRID_API_KEY="SG.paste_your_new_api_key_here"
SENDGRID_FROM_EMAIL="estlopacu@gmail.com"
```

### Step 4: Test Again

```bash
npx ts-node src/test-email-client.ts
```

You should see:
```
✅ Email sent successfully!

📬 Next steps:
   1. Check your inbox at estlopacu@gmail.com
   2. If not in inbox, check spam/junk folder
```

## Still Having Issues?

### Check SendGrid Dashboard

1. **Login**: https://app.sendgrid.com/
2. **Check Activity Feed**: See if emails are being sent
   - URL: https://app.sendgrid.com/email_activity
3. **Check Sender Status**: Verify your email is verified
   - URL: https://app.sendgrid.com/settings/sender_auth/senders

### Common Errors

#### Error: "The from email does not contain a valid address"
**Solution**: Your sender email is not verified. Complete Step 1 above.

#### Error: "Permission denied" or "Forbidden" (403)
**Solution**: API key has wrong permissions. Complete Step 2 above.

#### Error: "Unauthorized" (401)
**Solution**: API key is invalid. Create a new one in Step 2.

#### Error: "Daily sending limit exceeded"
**Solution**: You've sent 100 emails today. Wait until tomorrow (resets midnight UTC).

## Test with Different Email

If you want to send a test to a different email address:

```bash
# Send to another email
npx ts-node src/test-email-client.ts another@example.com
```

## Visual Checklist

Before testing, make sure:
- [ ] SendGrid account is created
- [ ] Email `estlopacu@gmail.com` is verified (green checkmark)
- [ ] API key is created with "Full Access" or "Mail Send" permission
- [ ] API key starts with `SG.`
- [ ] API key is copied to `.env` file
- [ ] `.env` file has both `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`

## Quick Links

- **SendGrid Dashboard**: https://app.sendgrid.com/
- **API Keys**: https://app.sendgrid.com/settings/api_keys
- **Sender Authentication**: https://app.sendgrid.com/settings/sender_auth
- **Activity Feed**: https://app.sendgrid.com/email_activity

---

After fixing, run: `npx ts-node src/test-email-client.ts`
