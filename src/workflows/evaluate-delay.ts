import type { TrafficConditions } from '../types/traffic-conditions';
import { DELAY_THRESHOLD_MINUTES } from '../constants';

export interface DelayEvaluation {
  exceedsThreshold: boolean;
  delayInMinutes: number;
  thresholdMinutes: number;
}

export function evaluateDelayThreshold(trafficConditions: TrafficConditions): DelayEvaluation {
  const delayInMinutes = trafficConditions.delayInMinutes;
  const exceedsThreshold = delayInMinutes > DELAY_THRESHOLD_MINUTES;

  return {
    exceedsThreshold,
    delayInMinutes,
    thresholdMinutes: DELAY_THRESHOLD_MINUTES,
  };
}
