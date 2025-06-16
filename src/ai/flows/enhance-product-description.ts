'use server';

/**
 * @fileOverview AI flow to enhance product descriptions from scanned labels.
 *
 * - enhanceProductDescription - A function that enhances product descriptions.
 * - EnhanceProductDescriptionInput - The input type for the enhanceProductDescription function.
 * - EnhanceProductDescriptionOutput - The return type for the enhanceProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceProductDescriptionInputSchema = z.object({
  productLabelDataUri: z
    .string()
    .describe(
      "A photo of a product label, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productName: z.string().describe('The name of the product.'),
});
export type EnhanceProductDescriptionInput = z.infer<
  typeof EnhanceProductDescriptionInputSchema
>;

const EnhanceProductDescriptionOutputSchema = z.object({
  enhancedDescription: z
    .string()
    .describe('An enhanced and engaging description of the product.'),
});
export type EnhanceProductDescriptionOutput = z.infer<
  typeof EnhanceProductDescriptionOutputSchema
>;

export async function enhanceProductDescription(
  input: EnhanceProductDescriptionInput
): Promise<EnhanceProductDescriptionOutput> {
  return enhanceProductDescriptionFlow(input);
}

const enhanceProductDescriptionPrompt = ai.definePrompt({
  name: 'enhanceProductDescriptionPrompt',
  input: {schema: EnhanceProductDescriptionInputSchema},
  output: {schema: EnhanceProductDescriptionOutputSchema},
  prompt: `You are an expert marketing copywriter. You are provided the name of a product and an image of its label.  Your goal is to write a detailed and engaging product description to attract more customers.

Product Name: {{{productName}}}
Product Label: {{media url=productLabelDataUri}}`,
});

const enhanceProductDescriptionFlow = ai.defineFlow(
  {
    name: 'enhanceProductDescriptionFlow',
    inputSchema: EnhanceProductDescriptionInputSchema,
    outputSchema: EnhanceProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await enhanceProductDescriptionPrompt(input);
    return output!;
  }
);
