import { proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import type * as trafficConditions from './activities/check-traffic-conditions';
import type * as messageActivities from './activities/generate-delay-message';
import type * as notificationActivities from './activities/send-email-notification';
import type { DeliveryRoute } from './types/delivery-route';
import type { FreightDelayWorkflowResult } from './types/workflow';
import {
  DELAY_THRESHOLD_MINUTES,
  TRAFFIC_CONDITIONS_TIMEOUT,
  MESSAGE_GENERATION_TIMEOUT,
  EMAIL_NOTIFICATION_TIMEOUT,
  RETRY_INITIAL_INTERVAL,
  RETRY_BACKOFF_COEFFICIENT,
  RETRY_MAX_ATTEMPTS,
  RETRY_MAX_INTERVAL,
} from './constants';

const { checkTrafficConditions } = proxyActivities<typeof trafficConditions>({
  startToCloseTimeout: TRAFFIC_CONDITIONS_TIMEOUT,
});

const { generateDelayMessage } = proxyActivities<typeof messageActivities>({
  startToCloseTimeout: MESSAGE_GENERATION_TIMEOUT,
});

const { sendEmailNotification } = proxyActivities<typeof notificationActivities>({
  startToCloseTimeout: EMAIL_NOTIFICATION_TIMEOUT,
  retry: {
    initialInterval: RETRY_INITIAL_INTERVAL,
    backoffCoefficient: RETRY_BACKOFF_COEFFICIENT,
    maximumAttempts: RETRY_MAX_ATTEMPTS,
    maximumInterval: RETRY_MAX_INTERVAL,
    nonRetryableErrorTypes: ['Missing SendGrid environment variables'], // Don't retry config errors
  },
});

export async function freightDelayNotification(route: DeliveryRoute): Promise<FreightDelayWorkflowResult> {
  // Step 1: Check traffic conditions using Google Maps API
  const trafficConditions = await checkTrafficConditions(route);

  // Step 2: Check if delay exceeds threshold
  const delayExceedsThreshold = trafficConditions.delayInMinutes >= DELAY_THRESHOLD_MINUTES;

  if (!delayExceedsThreshold) {
    // No significant delay - return early without sending notification
    return {
      delayDetected: false,
      trafficConditions,
      notificationSent: false,
    };
  }

  // Delay exceeds threshold - proceed with notification
  // Step 3: Generate AI message using Claude
  const notificationMessage = await generateDelayMessage({
    route,
    trafficConditions,
    customerName: route.customerName,
  });

  // Step 4: Send notification via email with fallback handling
  let notificationSent = false;
  let notificationError: string | undefined;

  try {
    await sendEmailNotification({
      to: route.customerEmail,
      subject: `Delivery Delay Alert: ${route.origin} to ${route.destination}`,
      message: notificationMessage,
    });
    notificationSent = true;
  } catch (error) {
    // Log the error but don't fail the workflow
    // The notification message was generated, so we can return it
    // for manual follow-up or alternative notification methods
    notificationError = error instanceof Error ? error.message : 'Unknown error sending email';
    console.error('Email notification failed after retries:', notificationError);

    // In production, you might want to:
    // 1. Send to a dead letter queue for manual processing
    // 2. Try an alternative notification method (SMS, push notification)
    // 3. Create a task for manual follow-up
    // 4. Log to monitoring system for alerting
  }

  return {
    delayDetected: true,
    trafficConditions,
    notificationSent,
    notificationMessage,
    notificationError,
  };
}
