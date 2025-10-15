# SendGrid Email Setup Guide

## Why SendGrid?

SendGrid offers **100 emails per day for free** with no expiration, which is perfect for testing and small-scale deployments. Unlike Twilio SMS (which has a 9 message daily limit on trial accounts), SendGrid's free tier is more generous.

### Comparison:
- **SendGrid Free Tier**: 100 emails/day, no expiration ✅
- **Twilio SMS Trial**: 9 messages/day (you've hit this limit) ❌

## Step-by-Step Setup

### 1. Create SendGrid Account

1. Visit [https://signup.sendgrid.com/](https://signup.sendgrid.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Create API Key

1. Log in to SendGrid
2. Go to **Settings** → **API Keys**
   - URL: https://app.sendgrid.com/settings/api_keys
3. Click **Create API Key**
4. Give it a name (e.g., "Freight Delay Notifications")
5. Select **Full Access** (or at minimum, **Mail Send** access)
6. Click **Create & View**
7. **IMPORTANT**: Copy the API key immediately - you won't be able to see it again!

### 3. Verify Sender Identity

SendGrid requires you to verify your sender email address:

#### Option A: Single Sender Verification (Easiest)
1. Go to **Settings** → **Sender Authentication**
   - URL: https://app.sendgrid.com/settings/sender_auth
2. Click **Verify a Single Sender**
3. Fill in your details:
   - From Name: Your name or company name
   - From Email Address: Your email (this will be the "from" address)
   - Reply To: Same email or support email
   - Company Address: Your address
4. Click **Create**
5. Check your email and click the verification link
6. Once verified, you can send emails from this address

#### Option B: Domain Authentication (Advanced)
- Requires DNS access to your domain
- Better for production use
- Follow SendGrid's domain authentication wizard

### 4. Update .env File

Add your credentials to the `.env` file:

```bash
# SendGrid Credentials
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="your-verified-email@example.com"
```

**Replace:**
- `SG.xxx...` with your actual API key from step 2
- `your-verified-email@example.com` with the email you verified in step 3

### 5. Test the Setup

Run the test client to verify everything works:

```bash
npx ts-node src/test-email-client.ts
```

This will send a test email to verify your SendGrid integration is working.

## Daily Limits

### Free Tier Limits:
- **100 emails per day**
- **No expiration**
- Perfect for:
  - Development and testing
  - Small-scale applications
  - Personal projects
  - POCs and demos

### When to Upgrade:
Upgrade to a paid plan when you need:
- More than 100 emails/day
- Dedicated IP address
- Advanced analytics
- Priority support

**Pricing**: Starts at $19.95/month for 50,000 emails

## Troubleshooting

### Error: "Missing SendGrid environment variables"
**Solution**: Make sure you've added `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` to your `.env` file

### Error: "The from email does not contain a valid address"
**Solution**: Verify your sender email address in SendGrid dashboard (Settings → Sender Authentication)

### Error: "Permission denied" or "Forbidden"
**Solution**: Make sure your API key has "Mail Send" permissions. Create a new API key with Full Access.

### Error: "Daily sending limit exceeded"
**Solution**: You've sent more than 100 emails today. Wait until tomorrow (resets at midnight UTC) or upgrade your account.

## Security Best Practices

1. **Never commit your API key to git**
   - The `.env` file is in `.gitignore`
   - Never share your API key publicly

2. **Rotate API keys periodically**
   - Create new keys every few months
   - Delete old unused keys

3. **Use minimum required permissions**
   - For this app, "Mail Send" permission is sufficient
   - Avoid "Full Access" in production if possible

4. **Monitor usage**
   - Check SendGrid dashboard regularly
   - Set up usage alerts in SendGrid

## Testing Email Delivery

### Test with Real Email
Send to your actual email address to verify:
- Email arrives in inbox (not spam)
- Formatting looks correct
- Subject line is appropriate
- HTML version renders properly

### Test with Multiple Providers
Test with different email providers to ensure compatibility:
- Gmail
- Outlook/Hotmail
- Yahoo Mail
- ProtonMail
- Custom domain emails

### Spam Testing
- Check spam folder if emails don't arrive
- Use [Mail Tester](https://www.mail-tester.com/) to check spam score
- Ensure SPF/DKIM are configured (domain authentication)

## SendGrid Dashboard Features

Once set up, you can use SendGrid's dashboard to:
- View email delivery statistics
- Track open rates and click rates
- Monitor bounces and spam reports
- Debug delivery issues
- View email activity feed

Access dashboard at: https://app.sendgrid.com/

## Next Steps

After setup:
1. ✅ Run the test client to verify email sending works
2. ✅ Test the full workflow with a real delivery route
3. ✅ Monitor your daily usage in SendGrid dashboard
4. ✅ Set up domain authentication for production (optional)

## Support

- **SendGrid Documentation**: https://docs.sendgrid.com/
- **SendGrid Support**: https://support.sendgrid.com/
- **API Reference**: https://docs.sendgrid.com/api-reference/mail-send/mail-send

---

**Ready to test?** Run: `npx ts-node src/test-email-client.ts`
