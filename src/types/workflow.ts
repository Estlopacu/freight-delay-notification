import type { DeliveryRoute } from './delivery-route';
import type { TrafficConditions } from './traffic-conditions';

/**
 * Input parameters for the freight delay notification workflow
 */
export interface FreightDelayWorkflowInput {
  /** The delivery route to monitor */
  route: DeliveryRoute;
  /** Delay threshold in minutes - notifications sent if delay exceeds this */
  delayThresholdMinutes: number;
  /** Customer contact information for notifications */
  customerEmail: string;
  /** Optional customer name for personalization */
  customerName?: string;
}

/**
 * Result of the freight delay workflow
 */
export interface FreightDelayWorkflowResult {
  /** Whether a significant delay was detected */
  delayDetected: boolean;
  /** The traffic conditions found */
  trafficConditions: TrafficConditions;
  /** Whether a notification was sent successfully */
  notificationSent: boolean;
  /** The notification message if one was generated */
  notificationMessage?: string;
  /** Error message if notification failed */
  notificationError?: string;
}
