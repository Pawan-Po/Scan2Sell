'use server';

/**
 * @fileOverview AI flow to extract a barcode from an image using OCR.
 *
 * - extractBarcode - A function that extracts a barcode from an image.
 * - ExtractBarcodeInput - The input type for the extractBarcode function.
 * - ExtractBarcodeOutput - The return type for the extractBarcode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractBarcodeInputSchema = z.object({
  productLabelDataUri: z
    .string()
    .describe(
      "A photo of a product label, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractBarcodeInput = z.infer<typeof ExtractBarcodeInputSchema>;

const ExtractBarcodeOutputSchema = z.object({
  barcode: z
    .string()
    .describe('The extracted barcode number. Returns an empty string if no barcode is found.'),
});
export type ExtractBarcodeOutput = z.infer<typeof ExtractBarcodeOutputSchema>;

export async function extractBarcode(
  input: ExtractBarcodeInput
): Promise<ExtractBarcodeOutput> {
  return extractBarcodeFlow(input);
}

const extractBarcodePrompt = ai.definePrompt({
  name: 'extractBarcodePrompt',
  input: {schema: ExtractBarcodeInputSchema},
  output: {schema: ExtractBarcodeOutputSchema},
  prompt: `You are an optical character recognition (OCR) specialist. Your sole purpose is to find and extract the numerical barcode from the provided image.

- ONLY return the numerical digits of the barcode.
- Do not include any other text, descriptions, or explanations.
- If no barcode is clearly visible or decipherable in the image, return an empty string for the 'barcode' field.

Image with potential barcode: {{media url=productLabelDataUri}}`,
});

const extractBarcodeFlow = ai.defineFlow(
  {
    name: 'extractBarcodeFlow',
    inputSchema: ExtractBarcodeInputSchema,
    outputSchema: ExtractBarcodeOutputSchema,
  },
  async input => {
    const {output} = await extractBarcodePrompt(input);
    return output!;
  }
);
