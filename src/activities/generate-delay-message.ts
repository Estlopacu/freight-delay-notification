import Anthropic from '@anthropic-ai/sdk';
import type { MessageGenerationInput } from '../types/message-generation';
import getAIMessagePrompt from '../utils/ai-message-prompt';
import { generateFallbackMessage } from '../utils/fallback-message';

export async function generateDelayMessage(input: MessageGenerationInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.log('No Anthropic API key found, using fallback message template');
    return generateFallbackMessage(input);
  }

  const prompt = getAIMessagePrompt(input);

  try {
    const anthropic = new Anthropic({
      apiKey,
    });

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    return textContent.text.trim();
  } catch (error) {
    console.error(
      'AI message generation failed, using fallback template:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return generateFallbackMessage(input);
  }
}
