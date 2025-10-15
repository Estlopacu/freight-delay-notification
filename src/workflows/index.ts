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

import type { DeliveryRoute, FreightDelayWorkflowResult } from '../types';
import { checkTrafficStep } from './step1-check-traffic';
import { evaluateDelayThreshold } from './step2-evaluate-delay';
import { generateMessageStep } from './step3-generate-message';
import { sendNotificationStep } from './step4-send-notification';

/**
 * Main workflow for freight delay notification
 */
export async function freightDelayNotification(route: DeliveryRoute): Promise<FreightDelayWorkflowResult> {
  // ========================================
  // STEP 1: Check traffic conditions
  // ========================================
  const trafficConditions = await checkTrafficStep(route);

  // ========================================
  // STEP 2: Evaluate delay threshold
  // ========================================
  const delayEvaluation = evaluateDelayThreshold(trafficConditions);

  if (!delayEvaluation.exceedsThreshold) {
    // No significant delay - return early without sending notification
    return {
      delayDetected: false,
      trafficConditions,
      notificationSent: false,
    };
  }

  // ========================================
  // STEP 3: Generate notification message
  // ========================================
  // Delay exceeds threshold - proceed with notification
  const notificationMessage = await generateMessageStep(route, trafficConditions);

  // ========================================
  // STEP 4: Send email notification
  // ========================================
  const notificationResult = await sendNotificationStep(route, notificationMessage);

  // Return complete workflow result
  return {
    delayDetected: true,
    trafficConditions,
    notificationSent: notificationResult.sent,
    notificationMessage,
    notificationError: notificationResult.error,
  };
}
