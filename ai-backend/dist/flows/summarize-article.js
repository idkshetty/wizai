"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeArticle = summarizeArticle;
/**
 * @fileOverview Summarizes a given article.
 *
 * - summarizeArticle - A function that summarizes an article.
 * - SummarizeArticleInput - The input type for the summarizeArticle function.
 * - SummarizeArticleOutput - The return type for the summarizeArticle function.
 */
const genkit_1 = require("../genkit");
const genkit_2 = require("genkit");
const SummarizeArticleInputSchema = genkit_2.z.object({
    article: genkit_2.z.string().describe('The article to summarize.'),
});
const SummarizeArticleOutputSchema = genkit_2.z.object({
    summary: genkit_2.z.string().describe('A concise summary of the article.'),
});
async function summarizeArticle(input) {
    return summarizeArticleFlow(input);
}
const summarizeArticlePrompt = genkit_1.ai.definePrompt({
    name: 'summarizeArticlePrompt',
    input: { schema: SummarizeArticleInputSchema },
    output: { schema: SummarizeArticleOutputSchema },
    prompt: `Summarize the following article in a concise manner:\n\n{{{article}}}`,
});
const summarizeArticleFlow = genkit_1.ai.defineFlow({
    name: 'summarizeArticleFlow',
    inputSchema: SummarizeArticleInputSchema,
    outputSchema: SummarizeArticleOutputSchema,
}, async (input) => {
    const { output } = await summarizeArticlePrompt(input);
    return output;
});
