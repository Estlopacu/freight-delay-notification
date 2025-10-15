# SMS Notification Fallback Strategy

## Overview

The freight delay notification system implements a comprehensive fallback strategy when SMS notifications fail. This ensures that delay information is captured and available even when the primary notification method fails.

## Retry Policy Configuration

SMS notifications are configured with the following retry policy:

```typescript
retry: {
  initialInterval: '1 second',      // Start with 1 second delay
  backoffCoefficient: 2,             // Double the interval each retry (exponential backoff)
  maximumAttempts: 3,                // Try up to 3 times
  maximumInterval: '10 seconds',     // Cap retry interval at 10 seconds
  nonRetryableErrorTypes: [          // Don't retry these errors
    'Missing Twilio environment variables'
  ],
}
```

### Retry Timeline:
- **Attempt 1**: Immediate
- **Attempt 2**: After 1 second
- **Attempt 3**: After 3 seconds (1s + 2s backoff)
- **Total time**: ~4 seconds before giving up

## Error Handling Behavior

### When SMS Fails:

1. **Workflow Continues**: The workflow does not fail if SMS sending fails
2. **Error Captured**: The error message is captured in `notificationError` field
3. **Message Preserved**: The generated notification message is returned in the result
4. **Status Accurate**: `notificationSent` is set to `false`

### Workflow Result When SMS Fails:

```typescript
{
  delayDetected: true,
  trafficConditions: { /* traffic data */ },
  notificationSent: false,              // ❌ SMS failed
  notificationMessage: "...",           // ✅ Message still available
  notificationError: "Rate limit exceeded" // ✅ Error captured
}
```

## Non-Retryable Errors

The following errors are **not retried** because they indicate configuration issues:

- Missing Twilio environment variables (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)

These require manual intervention to fix and would not succeed on retry.

## Retryable Errors

The following errors **are retried** automatically:

- Network failures
- Twilio API rate limits (429 errors)
- Temporary service outages
- Timeout errors

## Production Recommendations

When SMS notification fails after all retries, consider implementing one or more of these fallback strategies:

### 1. Alternative Notification Channel

Add email as a backup notification method:

```typescript
try {
  await sendSmsNotification({ to, message });
  notificationSent = true;
  notificationChannel = 'SMS';
} catch (smsError) {
  // Fallback to email
  try {
    await sendEmailNotification({ to: customerEmail, message });
    notificationSent = true;
    notificationChannel = 'Email';
  } catch (emailError) {
    notificationSent = false;
    notificationError = `SMS: ${smsError.message}, Email: ${emailError.message}`;
  }
}
```

### 2. Dead Letter Queue

Send failed notifications to a queue for manual processing:

```typescript
catch (error) {
  // Send to dead letter queue
  await sendToDeadLetterQueue({
    type: 'failed_sms_notification',
    customerPhone: to,
    message: notificationMessage,
    error: error.message,
    timestamp: new Date().toISOString(),
  });
}
```

### 3. Create Follow-up Task

Create a task in your task management system:

```typescript
catch (error) {
  await createTask({
    title: `Failed SMS to ${to}`,
    description: `Message: ${notificationMessage}\nError: ${error.message}`,
    priority: 'high',
    assignee: 'customer-support',
  });
}
```

### 4. Monitoring & Alerting

Log to monitoring system for real-time alerts:

```typescript
catch (error) {
  // Log to monitoring service (e.g., Datadog, New Relic, Sentry)
  logger.error('SMS notification failed after retries', {
    error: error.message,
    customerPhone: to,
    delayMinutes: trafficConditions.delayInMinutes,
    route: `${route.origin} -> ${route.destination}`,
  });
}
```

### 5. Webhook Notification

Call a webhook to trigger external systems:

```typescript
catch (error) {
  await fetch('https://your-webhook-url.com/notification-failed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: to,
      message: notificationMessage,
      error: error.message,
      timestamp: Date.now(),
    }),
  });
}
```

## Testing Fallback Behavior

The test suite includes a specific test for SMS failure handling:

```typescript
it('should handle SMS notification failure gracefully', async () => {
  // Mock SMS to throw an error
  sendSmsNotification: async () => {
    throw new Error('Twilio API error: Rate limit exceeded');
  }

  // Workflow should complete successfully
  // with notificationSent: false and notificationError populated
});
```

Run tests with:
```bash
npm test -- workflows.test.ts
```

## Common Error Messages

| Error | Cause | Retryable? | Solution |
|-------|-------|------------|----------|
| Missing Twilio environment variables | Configuration issue | ❌ No | Set env vars in .env |
| Rate limit exceeded | Too many messages | ✅ Yes | Wait or upgrade Twilio plan |
| Invalid phone number | Bad format | ❌ No | Validate E.164 format |
| Authentication failed | Wrong credentials | ❌ No | Check ACCOUNT_SID and AUTH_TOKEN |
| Network timeout | Network issue | ✅ Yes | Automatic retry |

## Monitoring Recommendations

Track these metrics:

- **SMS Success Rate**: `notificationSent: true` / total attempts
- **Retry Count**: How often retries are needed
- **Error Types**: Which errors occur most frequently
- **Fallback Usage**: How often fallback methods are used

## Example: Complete Fallback Implementation

Here's a complete example with multiple fallback strategies:

```typescript
// Step 4: Send notification with comprehensive fallback
let notificationSent = false;
let notificationChannel: string | undefined;
let notificationError: string | undefined;

try {
  await sendSmsNotification({ to: route.customerPhoneNumber, message: notificationMessage });
  notificationSent = true;
  notificationChannel = 'SMS';
} catch (smsError) {
  const smsErrorMsg = smsError instanceof Error ? smsError.message : 'Unknown SMS error';
  console.error('SMS notification failed after retries:', smsErrorMsg);

  // Fallback 1: Try email
  if (route.customerEmail) {
    try {
      await sendEmailNotification({
        to: route.customerEmail,
        subject: 'Delivery Delay Alert',
        body: notificationMessage
      });
      notificationSent = true;
      notificationChannel = 'Email';
    } catch (emailError) {
      const emailErrorMsg = emailError instanceof Error ? emailError.message : 'Unknown email error';
      console.error('Email fallback also failed:', emailErrorMsg);
      notificationError = `SMS: ${smsErrorMsg}; Email: ${emailErrorMsg}`;
    }
  } else {
    notificationError = smsErrorMsg;
  }

  // Fallback 2: Always log to monitoring
  await logNotificationFailure({
    route,
    message: notificationMessage,
    smsError: smsErrorMsg,
    timestamp: new Date(),
  });

  // Fallback 3: Create support ticket if all notifications failed
  if (!notificationSent) {
    await createSupportTicket({
      priority: 'high',
      subject: `Failed to notify customer about delivery delay`,
      details: {
        customer: route.customerName,
        phone: route.customerPhoneNumber,
        route: `${route.origin} -> ${route.destination}`,
        delay: trafficConditions.delayInMinutes,
        message: notificationMessage,
        errors: notificationError,
      },
    });
  }
}

return {
  delayDetected: true,
  trafficConditions,
  notificationSent,
  notificationChannel,
  notificationMessage,
  notificationError,
};
```

## Summary

The fallback strategy ensures:

✅ **Resilience**: System continues to work even when SMS fails
✅ **Visibility**: Errors are captured and logged
✅ **Data Preservation**: Notification messages are never lost
✅ **Automatic Recovery**: Retries handle temporary failures
✅ **Extensibility**: Easy to add more fallback methods

This approach provides a robust notification system that gracefully handles failures while ensuring critical delay information is never lost.
