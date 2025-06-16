
'use server';
/**
 * @fileOverview AI flow to extract structured product information from a label image.
 *
 * - extractProductInfo - A function that extracts product data from an image.
 * - ExtractProductInfoInput - The input type for the extractProductInfo function.
 * - ExtractProductInfoOutput - The return type for the extractProductInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractProductInfoInputSchema = z.object({
  productLabelDataUri: z
    .string()
    .describe(
      "A photo of a product label, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractProductInfoInput = z.infer<
  typeof ExtractProductInfoInputSchema
>;

const ExtractProductInfoOutputSchema = z.object({
  productName: z.string().optional().describe('The name of the product. If not found, return an empty string or omit.'),
  price: z.string().optional().describe('The price of the product as a string (e.g., "5.99", "$10.00"). If not found, return an empty string or omit.'),
  barcode: z.string().optional().describe('The barcode number if visible. If not found, return an empty string or omit.'),
  description: z.string().optional().describe('A brief description or key features extracted from the label. If not found, return an empty string or omit.'),
});
export type ExtractProductInfoOutput = z.infer<
  typeof ExtractProductInfoOutputSchema
>;

export async function extractProductInfo(
  input: ExtractProductInfoInput
): Promise<ExtractProductInfoOutput> {
  return extractProductInfoFlow(input);
}

const extractProductInfoPrompt = ai.definePrompt({
  name: 'extractProductInfoPrompt',
  input: {schema: ExtractProductInfoInputSchema},
  output: {schema: ExtractProductInfoOutputSchema},
  prompt: `You are an AI assistant helping to digitize product information from labels.
Given an image of a product label, extract the following information.
If a piece of information is not clearly visible or inferable from the image, omit it or return an empty string for that field.

- Product Name: The main name of the product.
- Price: The price of the product, including currency symbols if present (e.g., "$10.99", "€5.50").
- Barcode: The numerical barcode sequence, if visible.
- Description: Any brief descriptive text, key features, or ingredients listed on the label.

Respond with a JSON object matching the output schema.

Product Label Image: {{media url=productLabelDataUri}}`,
  config: {
    temperature: 0.2, // Lower temperature for more factual extraction
  }
});

const extractProductInfoFlow = ai.defineFlow(
  {
    name: 'extractProductInfoFlow',
    inputSchema: ExtractProductInfoInputSchema,
    outputSchema: ExtractProductInfoOutputSchema,
  },
  async input => {
    const {output} = await extractProductInfoPrompt(input);
    return output!;
  }
);
