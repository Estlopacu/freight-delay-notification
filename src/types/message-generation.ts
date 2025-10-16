import type { DeliveryRoute } from './delivery-route';
import type { TrafficConditions } from './traffic-conditions';

/**
 * Input parameters for AI message generation
 */
export interface MessageGenerationInput {
  route: DeliveryRoute;
  trafficConditions: TrafficConditions;
  customerName?: string;
}
