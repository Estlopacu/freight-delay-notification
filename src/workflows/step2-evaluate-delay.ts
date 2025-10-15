/**
 * Step 2: Evaluate Delay Threshold
 *
 * This step determines whether the traffic delay exceeds the configured threshold
 * and decides if a notification should be sent.
 */

import type { TrafficConditions } from '../types';
import { DELAY_THRESHOLD_MINUTES } from '../constants';

export interface DelayEvaluation {
  /** Whether the delay exceeds the threshold */
  exceedsThreshold: boolean;
  /** The actual delay in minutes */
  delayInMinutes: number;
  /** The threshold that was used for comparison */
  thresholdMinutes: number;
}

/**
 * Evaluate if the delay exceeds the notification threshold
 */
export function evaluateDelayThreshold(trafficConditions: TrafficConditions): DelayEvaluation {
  const delayInMinutes = trafficConditions.delayInMinutes;
  const exceedsThreshold = delayInMinutes >= DELAY_THRESHOLD_MINUTES;

  return {
    exceedsThreshold,
    delayInMinutes,
    thresholdMinutes: DELAY_THRESHOLD_MINUTES,
  };
}
