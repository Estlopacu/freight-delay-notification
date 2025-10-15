import { checkTrafficConditions } from '../traffic-conditions';
import { Client } from '@googlemaps/google-maps-services-js';
import type { DeliveryRoute } from '../types';

jest.mock('@googlemaps/google-maps-services-js');

describe('checkTrafficConditions', () => {
  const mockRoute: DeliveryRoute = {
    origin: 'New York, NY',
    destination: 'Boston, MA',
    customerEmail: 'test@example.com',
  };

  beforeEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';

    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.GOOGLE_MAPS_API_KEY;
  });

  it('should return traffic conditions with delay when traffic exists', async () => {
    const mockResponse = {
      data: {
        status: 'OK',
        routes: [
          {
            summary: 'I-95 N',
            legs: [
              {
                distance: { value: 347540 }, // meters
                duration: { value: 13260 }, // 221 minutes in seconds
                duration_in_traffic: { value: 14280 }, // 238 minutes in seconds
              },
            ],
          },
        ],
      },
    };

    (Client.prototype.directions as jest.Mock) = jest.fn().mockResolvedValue(mockResponse);

    const result = await checkTrafficConditions(mockRoute);

    expect(result).toEqual({
      distance: 347540,
      durationWithoutTraffic: 13260,
      durationInTraffic: 14280,
      delayInSeconds: 1020,
      delayInMinutes: 17,
      routeSummary: 'I-95 N',
    });

    // Verify the API was called with correct parameters
    expect(Client.prototype.directions).toHaveBeenCalledWith({
      params: {
        origin: 'New York, NY',
        destination: 'Boston, MA',
        mode: 'driving',
        departure_time: 'now',
        key: 'test-api-key',
      },
    });
  });

  it('should return zero delay when no traffic exists', async () => {
    const mockResponse = {
      data: {
        status: 'OK',
        routes: [
          {
            summary: 'I-90 W',
            legs: [
              {
                distance: { value: 150000 },
                duration: { value: 7200 }, // 120 minutes
                duration_in_traffic: { value: 7200 }, // Same as duration - no traffic
              },
            ],
          },
        ],
      },
    };

    (Client.prototype.directions as jest.Mock) = jest.fn().mockResolvedValue(mockResponse);

    const result = await checkTrafficConditions(mockRoute);

    expect(result.delayInSeconds).toBe(0);
    expect(result.delayInMinutes).toBe(0);
  });

  it('should handle missing duration_in_traffic field', async () => {
    // Some routes might not have duration_in_traffic
    const mockResponse = {
      data: {
        status: 'OK',
        routes: [
          {
            summary: 'Highway 1',
            legs: [
              {
                distance: { value: 100000 },
                duration: { value: 3600 },
                // No duration_in_traffic field
              },
            ],
          },
        ],
      },
    };

    (Client.prototype.directions as jest.Mock) = jest.fn().mockResolvedValue(mockResponse);

    const result = await checkTrafficConditions(mockRoute);

    // Should fall back to using duration as durationInTraffic
    expect(result.durationInTraffic).toBe(3600);
    expect(result.delayInSeconds).toBe(0);
  });

  it('should throw error when API key is not set', async () => {
    delete process.env.GOOGLE_MAPS_API_KEY;

    await expect(checkTrafficConditions(mockRoute)).rejects.toThrow(
      'GOOGLE_MAPS_API_KEY environment variable is not set'
    );
  });

  it('should throw error when API returns non-OK status', async () => {
    const mockResponse = {
      data: {
        status: 'ZERO_RESULTS',
        routes: [],
      },
    };

    (Client.prototype.directions as jest.Mock) = jest.fn().mockResolvedValue(mockResponse);

    await expect(checkTrafficConditions(mockRoute)).rejects.toThrow(
      'Google Maps API error: ZERO_RESULTS'
    );
  });

  it('should throw error when no routes are found', async () => {
    const mockResponse = {
      data: {
        status: 'OK',
        routes: [],
      },
    };

    (Client.prototype.directions as jest.Mock) = jest.fn().mockResolvedValue(mockResponse);

    await expect(checkTrafficConditions(mockRoute)).rejects.toThrow(
      'No routes found for the given origin and destination'
    );
  });

  it('should handle API request failure', async () => {
    (Client.prototype.directions as jest.Mock) = jest
      .fn()
      .mockRejectedValue(new Error('Network error'));

    await expect(checkTrafficConditions(mockRoute)).rejects.toThrow(
      'Failed to fetch traffic conditions: Network error'
    );
  });

  it('should correctly calculate delay in minutes', async () => {
    const mockResponse = {
      data: {
        status: 'OK',
        routes: [
          {
            summary: 'Test Route',
            legs: [
              {
                distance: { value: 50000 },
                duration: { value: 3000 }, // 50 minutes
                duration_in_traffic: { value: 3630 }, // 60.5 minutes
              },
            ],
          },
        ],
      },
    };

    (Client.prototype.directions as jest.Mock) = jest.fn().mockResolvedValue(mockResponse);

    const result = await checkTrafficConditions(mockRoute);

    // 630 seconds = 10.5 minutes, should round to 11
    expect(result.delayInSeconds).toBe(630);
    expect(result.delayInMinutes).toBe(11);
  });
});
