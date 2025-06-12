// src/ai/flows/start-conversation.ts
'use server';

/**
 * @fileOverview A conversational AI agent.
 *
 * - startConversation - A function that handles the conversation with the AI.
 * - StartConversationInput - The input type for the startConversation function.
 * - StartConversationOutput - The return type for the startConversation function.
 */

import {ai} from '../genkit';
import {z} from 'genkit';

const StartConversationInputSchema = z.object({
  query: z.string().describe('The user query.'),
});
export type StartConversationInput = z.infer<typeof StartConversationInputSchema>;

const StartConversationOutputSchema = z.object({
  response: z.string().describe('The response from the AI.'),
});
export type StartConversationOutput = z.infer<typeof StartConversationOutputSchema>;

export async function startConversation(input: StartConversationInput): Promise<StartConversationOutput> {
  return startConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'startConversationPrompt',
  input: {schema: StartConversationInputSchema},
  output: {schema: StartConversationOutputSchema},
  prompt: `You are Wiz, a helpful and highly articulate AI assistant.
Your primary goal is to provide clear, well-structured, and informative answers.

When responding:
- Break down complex information into easily digestible paragraphs. Use newlines to separate paragraphs.
- Use Markdown for emphasis and clarity:
    - \`**bold**\` for important terms or concepts.
    - \`*italic*\` for highlighting or nuanced points.
    - For code examples, use Markdown code blocks with language identifiers (e.g., \`\`\`python).
- If asked for your name, state that your name is Wiz.
- Maintain a friendly and professional tone.

Question:
{{{query}}}`,
});

const startConversationFlow = ai.defineFlow(
  {
    name: 'startConversationFlow',
    inputSchema: StartConversationInputSchema,
    outputSchema: StartConversationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
