import { proxyActivities } from '@temporalio/workflow';
import type * as notificationActivities from '../activities/send-email-notification';
import type { DeliveryRoute } from '../types/delivery-route';

const { sendEmailNotification } = proxyActivities<typeof notificationActivities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    initialInterval: '1 second',
    backoffCoefficient: 2,
    maximumAttempts: 3,
    maximumInterval: '10 seconds',
    nonRetryableErrorTypes: ['Missing SendGrid environment variables'], // Don't retry config errors
  },
});

export interface NotificationResult {
  sent: boolean;
  error?: string;
}

/**
 * Send email notification to the customer
 */
export async function sendNotificationStep(route: DeliveryRoute, message: string): Promise<NotificationResult> {
  try {
    await sendEmailNotification({
      to: route.customerEmail,
      subject: `Delivery Delay Alert: ${route.origin} to ${route.destination}`,
      message,
    });

    return {
      sent: true,
    };
  } catch (error) {
    // Log the error but don't fail the workflow
    // The notification message was generated, so we can return it
    // for manual follow-up or alternative notification methods
    const errorMessage = error instanceof Error ? error.message : 'Unknown error sending email';
    console.error('Email notification failed after retries:', errorMessage);

    // In production, you might want to:
    // 1. Send to a dead letter queue for manual processing
    // 2. Try an alternative notification method (SMS, push notification)
    // 3. Create a task for manual follow-up
    // 4. Log to monitoring system for alerting

    return {
      sent: false,
      error: errorMessage,
    };
  }
}
