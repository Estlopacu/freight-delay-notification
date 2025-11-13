/**
 * Main Workflow: Freight Delay Notification
 *
 * This workflow orchestrates the complete freight delay notification process
 * by executing four distinct steps in sequence:
 *
 * 1. Check traffic conditions on the delivery route
 * 2. Evaluate if the delay exceeds the notification threshold
 * 3. Generate a customer-friendly notification message (if needed)
 * 4. Send the notification via email (if needed)
 *
 * The workflow is designed to be deterministic and fault-tolerant,
 * with each step isolated in its own module for maintainability.
 */

import type { DeliveryRoute } from '../types/delivery-route';
import type { FreightDelayWorkflowResult } from '../types/workflow';
import { evaluateDelayThreshold } from '../utils/delay-evaluation';
import { checkTraffic } from './check-traffic';
import { generateMessageStep } from './generate-message';
import { sendNotificationStep } from './send-notification';

export async function freightDelayNotification(route: DeliveryRoute): Promise<FreightDelayWorkflowResult> {
  const trafficConditions = await checkTraffic(route);

  const delayEvaluation = evaluateDelayThreshold(trafficConditions);

  if (!delayEvaluation.exceedsThreshold) {
    return {
      delayDetected: false,
      trafficConditions,
      notificationSent: false,
    };
  }

  const notificationMessage = await generateMessageStep(route, trafficConditions);

  const notificationResult = await sendNotificationStep(route, notificationMessage);

  return {
    delayDetected: true,
    trafficConditions,
    notificationSent: notificationResult.sent,
    notificationMessage,
    notificationError: notificationResult.error,
  };
}
