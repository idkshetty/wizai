"use strict";
// src/ai/flows/start-conversation.ts
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.startConversation = startConversation;
/**
 * @fileOverview A conversational AI agent.
 *
 * - startConversation - A function that handles the conversation with the AI.
 * - StartConversationInput - The input type for the startConversation function.
 * - StartConversationOutput - The return type for the startConversation function.
 */
const genkit_1 = require("../genkit");
const genkit_2 = require("genkit");
const StartConversationInputSchema = genkit_2.z.object({
    query: genkit_2.z.string().describe('The user query.'),
});
const StartConversationOutputSchema = genkit_2.z.object({
    response: genkit_2.z.string().describe('The response from the AI.'),
});
async function startConversation(input) {
    return startConversationFlow(input);
}
const prompt = genkit_1.ai.definePrompt({
    name: 'startConversationPrompt',
    input: { schema: StartConversationInputSchema },
    output: { schema: StartConversationOutputSchema },
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
const startConversationFlow = genkit_1.ai.defineFlow({
    name: 'startConversationFlow',
    inputSchema: StartConversationInputSchema,
    outputSchema: StartConversationOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output;
});
