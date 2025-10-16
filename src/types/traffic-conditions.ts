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
