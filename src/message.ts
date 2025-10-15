import Anthropic from '@anthropic-ai/sdk';
import type { TrafficConditions, DeliveryRoute } from './types';

/**
 * Input parameters for AI message generation
 */
export interface MessageGenerationInput {
  route: DeliveryRoute;
  trafficConditions: TrafficConditions;
  customerName?: string;
}

/**
 * Generates a fallback message using a template when AI is unavailable
 */
function generateFallbackMessage(input: MessageGenerationInput): string {
  const { route, trafficConditions, customerName } = input;

  const greeting = customerName ? `Dear ${customerName},` : 'Dear Customer,';
  const delayTime = trafficConditions.delayInMinutes;
  const routeInfo = `from ${route.origin} to ${route.destination}`;

  return `${greeting} We wanted to inform you that your freight delivery ${routeInfo} is experiencing a ${delayTime}-minute delay due to current traffic conditions on ${trafficConditions.routeSummary}. We're actively monitoring the situation and will keep you updated. We apologize for any inconvenience this may cause.`;
}

export async function generateDelayMessage(input: MessageGenerationInput): Promise<string> {
  return generateFallbackMessage(input);

//   const apiKey = process.env.ANTHROPIC_API_KEY;

//   if (!apiKey) {
//     console.log('No Anthropic API key found, using fallback message template');
//   }

//   const anthropic = new Anthropic({
//     apiKey,
//   });

//   const { route, trafficConditions, customerName } = input;

//   const prompt = `You are a helpful customer service assistant for a freight delivery company. Generate a friendly and professional notification message about a delivery delay.

// Context:
// - Route: ${route.origin} to ${route.destination}
// - Distance: ${(trafficConditions.distance / 1000).toFixed(1)} km
// - Normal travel time: ${Math.round(trafficConditions.durationWithoutTraffic / 60)} minutes
// - Current travel time with traffic: ${Math.round(trafficConditions.durationInTraffic / 60)} minutes
// - Delay: ${trafficConditions.delayInMinutes} minutes
// - Route: ${trafficConditions.routeSummary}
// ${customerName ? `- Customer name: ${customerName}` : ''}

// Requirements:
// - Be friendly and professional
// - Keep it concise (2-3 sentences max)
// - Include the delay amount and reason (traffic)
// - Express that we're monitoring the situation
// - Don't use a greeting or closing (just the message content)
// ${customerName ? '- Address the customer by name' : '- Use a generic greeting'}

// Generate only the notification message, nothing else.`;

//   try {
//     const message = await anthropic.messages.create({
//       model: 'claude-3-5-sonnet-20241022',
//       max_tokens: 200,
//       messages: [
//         {
//           role: 'user',
//           content: prompt,
//         },
//       ],
//     });

//     // Extract the text from Claude's response
//     const textContent = message.content.find((block) => block.type === 'text');
//     if (!textContent || textContent.type !== 'text') {
//       throw new Error('No text content in Claude response');
//     }

//     return textContent.text.trim();
//   } catch (error) {
//     if (error instanceof Error) {
//       throw new Error(`Failed to generate delay message: ${error.message}`);
//     }
//     throw error;
//   }
}
