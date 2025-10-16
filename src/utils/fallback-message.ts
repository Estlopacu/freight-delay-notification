import type { MessageGenerationInput } from '../types/message-generation';

export function generateFallbackMessage(input: MessageGenerationInput): string {
  const { route, trafficConditions, customerName } = input;

  const greeting = customerName ? `Dear ${customerName},` : 'Dear Customer,';
  const delayTime = trafficConditions.delayInMinutes;
  const routeInfo = `from ${route.origin} to ${route.destination}`;

  return `${greeting} We wanted to inform you that your freight delivery ${routeInfo} is experiencing a ${delayTime}-minute delay due to current traffic conditions on ${trafficConditions.routeSummary}. We're actively monitoring the situation and will keep you updated. We apologize for any inconvenience this may cause.`;
}
