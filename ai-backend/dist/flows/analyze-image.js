"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImage = analyzeImage;
/**
 * @fileOverview An image analysis AI agent.
 *
 * - analyzeImage - A function that handles the image analysis process.
 * - AnalyzeImageInput - The input type for the analyzeImage function.
 * - AnalyzeImageOutput - The return type for the analyzeImage function.
 */
const genkit_1 = require("../genkit");
const genkit_2 = require("genkit");
const AnalyzeImageInputSchema = genkit_2.z.object({
    photoDataUri: genkit_2.z
        .string()
        .describe("A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
const AnalyzeImageOutputSchema = genkit_2.z.object({
    description: genkit_2.z.string().describe('A description of the image content.'),
});
async function analyzeImage(input) {
    return analyzeImageFlow(input);
}
const prompt = genkit_1.ai.definePrompt({
    name: 'analyzeImagePrompt',
    input: { schema: AnalyzeImageInputSchema },
    output: { schema: AnalyzeImageOutputSchema },
    prompt: `You are an expert in image analysis.  Describe the contents of the image.

  Here is the image:
  {{media url=photoDataUri}}
  `,
});
const analyzeImageFlow = genkit_1.ai.defineFlow({
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output;
});
