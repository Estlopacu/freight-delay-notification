import { proxyActivities } from '@temporalio/workflow';
import type * as trafficConditions from '../activities/check-traffic-conditions';
import type { DeliveryRoute } from '../types/delivery-route';
import type { TrafficConditions } from '../types/traffic-conditions';

const { checkTrafficConditions } = proxyActivities<typeof trafficConditions>({
  startToCloseTimeout: '2 minutes',
});

export async function checkTraffic(route: DeliveryRoute): Promise<TrafficConditions> {
  return await checkTrafficConditions(route);
}
