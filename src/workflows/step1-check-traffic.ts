/**
 * Step 1: Check Traffic Conditions
 *
 * This step queries the Google Maps API to get real-time traffic information
 * for the delivery route and calculates any delays.
 */

import { proxyActivities } from '@temporalio/workflow';
import type * as trafficConditions from '../traffic-conditions';
import type { DeliveryRoute, TrafficConditions } from '../types';

const { checkTrafficConditions } = proxyActivities<typeof trafficConditions>({
  startToCloseTimeout: '2 minutes',
});

/**
 * Check traffic conditions for the delivery route
 */
export async function checkTrafficStep(route: DeliveryRoute): Promise<TrafficConditions> {
  return await checkTrafficConditions(route);
}
