# Examples

Test scripts and demonstrations for the Freight Delay Notification system.

## Prerequisites

1. Set up your environment variables in `.env`:
   ```bash
   GOOGLE_MAPS_API_KEY=your_key_here
   SENDGRID_API_KEY=your_key_here
   SENDGRID_FROM_EMAIL=your_email@example.com
   ANTHROPIC_API_KEY=your_key_here  # Optional, for AI-generated messages
   ```

2. Start the Temporal server:
   ```bash
   temporal server start-dev
   ```

3. Start the worker (in a separate terminal):
   ```bash
   npm run start
   ```

## Scripts

### 1. Test Traffic Conditions
Tests the Google Maps API integration for checking real-time traffic.

```bash
npx ts-node src/examples/test-check-traffic.ts
```

**What it does:**
- Fetches real-time traffic data from Google Maps API
- Calculates delays based on current traffic conditions
- Validates your Google Maps API key is working
- Requires: GOOGLE_MAPS_API_KEY

### 2. Test Email Notification
Tests the SendGrid email integration directly.

```bash
npx ts-node src/examples/test-email-client.ts [optional-email]
```

**What it does:**
- Sends a test email using SendGrid
- Validates your API key and sender email
- Helps verify your email setup is working
- Requires: SENDGRID_API_KEY, SENDGRID_FROM_EMAIL

### 3. Test Notification Failure Handling
Demonstrates how the workflow handles notification failures gracefully.

```bash
npx ts-node src/examples/test-notification-failure.ts
```

**What it does:**
- Simulates a workflow execution with notification failure
- Demonstrates error handling and fallback strategies
- Shows how the workflow completes successfully despite email failure
- No external services required (fully simulated)

## Troubleshooting

- **Email not sent?** Check your SendGrid API key and verify your sender email at https://app.sendgrid.com/settings/sender_auth
- **Workflow test fails?** Ensure Temporal server is running and the worker is started
- **Traffic data issues?** Verify your Google Maps API key has the Directions API enabled

For more details, see:
- [SENDGRID_SETUP.md](../../SENDGRID_SETUP.md) - Email setup instructions
- [MIGRATION_TO_SENDGRID.md](../../MIGRATION_TO_SENDGRID.md) - Migration notes
