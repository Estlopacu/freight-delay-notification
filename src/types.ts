/**
 * Types for the freight delay notification system
 */

/**
 * Represents a delivery route with origin and destination
 */
export interface DeliveryRoute {
  origin: string;
  destination: string;
  waypoints?: string[];
  customerName?: string;
  customerEmail: string;
}

/**
 * Traffic condition information from Google Maps
 */
export interface TrafficConditions {
  /** Distance in meters */
  distance: number;
  /** Duration without traffic in seconds */
  durationWithoutTraffic: number;
  /** Duration with current traffic in seconds */
  durationInTraffic: number;
  /** Delay in seconds caused by traffic */
  delayInSeconds: number;
  /** Delay in minutes caused by traffic */
  delayInMinutes: number;
  /** The route summary/description */
  routeSummary: string;
}

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
