// src/ai/flows/start-conversation.ts
'use server';

/**
 * @fileOverview A conversational AI agent.
 *
 * - startConversation - A function that handles the conversation with the AI.
 * - StartConversationInput - The input type for the startConversation function.
 * - StartConversationOutput - The return type for the startConversation function.
 */

import {ai} from '@/ai/genkit';
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
  prompt: `You are a helpful AI assistant. Answer the following question to the best of your ability.\n\nQuestion: {{{query}}}`,
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
