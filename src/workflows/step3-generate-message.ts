/**
 * Step 3: Generate Notification Message
 *
 * This step generates a customer-friendly notification message about the delay
 * using AI or a fallback template.
 */

import { proxyActivities } from '@temporalio/workflow';
import type * as messageActivities from '../message';
import type { DeliveryRoute, TrafficConditions } from '../types';

const { generateDelayMessage } = proxyActivities<typeof messageActivities>({
  startToCloseTimeout: '30 seconds',
});

/**
 * Generate a notification message for the delay
 */
export async function generateMessageStep(
  route: DeliveryRoute,
  trafficConditions: TrafficConditions,
): Promise<string> {
  return await generateDelayMessage({
    route,
    trafficConditions,
    customerName: route.customerName,
  });
}
