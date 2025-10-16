import type { MessageGenerationInput } from '../types/message-generation';
import { METERS_TO_KILOMETERS, SECONDS_TO_MINUTES } from '../constants';

export default function getAIMessagePrompt(input: MessageGenerationInput): string {
  const { route, trafficConditions, customerName } = input;

  return `You are a helpful customer service assistant for a freight delivery company. Generate a friendly and professional notification message about a delivery delay.

Context:
- Route: ${route.origin} to ${route.destination}
- Distance: ${(trafficConditions.distance / METERS_TO_KILOMETERS).toFixed(1)} km
- Normal travel time: ${Math.round(trafficConditions.durationWithoutTraffic / SECONDS_TO_MINUTES)} minutes
- Current travel time with traffic: ${Math.round(trafficConditions.durationInTraffic / SECONDS_TO_MINUTES)} minutes
- Delay: ${trafficConditions.delayInMinutes} minutes
- Route: ${trafficConditions.routeSummary}
${customerName ? `- Customer name: ${customerName}` : ''}

Requirements:
- Be friendly and professional
- Keep it concise (2-3 sentences max)
- Include the delay amount and reason (traffic)
- Express that we're monitoring the situation
- Don't use a greeting or closing (just the message content)
${customerName ? '- Address the customer by name' : '- Use a generic greeting'}

Generate only the notification message, nothing else.`;
}
