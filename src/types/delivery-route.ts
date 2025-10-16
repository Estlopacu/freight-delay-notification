// Represents a delivery route with origin and destination
export interface DeliveryRoute {
  origin: string;
  destination: string;
  waypoints?: string[];
  customerName?: string;
  customerEmail: string;
}
