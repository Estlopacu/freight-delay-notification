import { Client, TravelMode } from '@googlemaps/google-maps-services-js';
import type { DeliveryRoute } from '../types/delivery-route';
import type { TrafficConditions } from '../types/traffic-conditions';

export async function checkTrafficConditions(route: DeliveryRoute): Promise<TrafficConditions> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set');
  }

  const client = new Client({});

  try {
    const response = await client.directions({
      params: {
        origin: route.origin,
        destination: route.destination,
        mode: TravelMode.driving,
        departure_time: 'now',
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    if (response.data.routes.length === 0) {
      throw new Error('No routes found for the given origin and destination');
    }

    const route_data = response.data.routes[0];
    const leg = route_data.legs[0];

    // Calculate delay: difference between duration in traffic and normal duration
    const durationInTraffic = leg.duration_in_traffic?.value || leg.duration.value;
    const durationWithoutTraffic = leg.duration.value;
    const delayInSeconds = durationInTraffic - durationWithoutTraffic;
    const delayInMinutes = Math.round(delayInSeconds / 60);

    const trafficConditions: TrafficConditions = {
      distance: leg.distance.value,
      durationWithoutTraffic,
      durationInTraffic,
      delayInSeconds,
      delayInMinutes,
      routeSummary: route_data.summary,
    };

    return trafficConditions;
  } catch (error) {
    // include a better logger, send errors to sentry
    if (error instanceof Error) {
      throw new Error(`Failed to fetch traffic conditions: ${error.message}`);
    }
    throw error;
  }
}
