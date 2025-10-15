import { proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import type * as trafficConditions from './traffic-conditions';
import type * as messageActivities from './message';
import type * as notificationActivities from './notifications';
import type { DeliveryRoute, FreightDelayWorkflowResult } from './types';
import { DELAY_THRESHOLD_MINUTES } from './constants';

const { checkTrafficConditions } = proxyActivities<typeof trafficConditions>({
  startToCloseTimeout: '2 minutes',
});

const { generateDelayMessage } = proxyActivities<typeof messageActivities>({
  startToCloseTimeout: '30 seconds',
});

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

/**
 * Main workflow for freight delay notification
 *
 * Steps:
 * 1. Check traffic conditions
 * 2. Determine if delay exceeds threshold
 * 3. If yes, generate AI message
 * 4. Send email notification
 */
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
