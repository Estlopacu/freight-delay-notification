import { proxyActivities } from '@temporalio/workflow';
import type * as messageActivities from '../activities/generate-delay-message';
import type { DeliveryRoute } from '../types/delivery-route';
import type { TrafficConditions } from '../types/traffic-conditions';

const { generateDelayMessage } = proxyActivities<typeof messageActivities>({
  startToCloseTimeout: '30 seconds',
});

export async function generateMessageStep(route: DeliveryRoute, trafficConditions: TrafficConditions): Promise<string> {
  return await generateDelayMessage({
    route,
    trafficConditions,
    customerName: route.customerName,
  });
}
