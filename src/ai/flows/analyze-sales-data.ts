'use server';

/**
 * @fileOverview AI flow to analyze sales data for business insights.
 *
 * - analyzeSalesData - A function that performs market basket analysis and demand forecasting.
 * - SalesAnalysisInput - The input type for the analyzeSalesData function.
 * - SalesAnalysisOutput - The return type for the analyzeSalesData function.
 */

import { ai } from '@/ai/genkit';
import type { SaleTransaction } from '@/lib/types';
import { z } from 'genkit';

const SalesAnalysisInputSchema = z.object({
  sales: z.custom<SaleTransaction[]>().describe('An array of sales transaction objects.'),
});
export type SalesAnalysisInput = z.infer<typeof SalesAnalysisInputSchema>;

const SalesAnalysisOutputSchema = z.object({
  marketBasketAnalysis: z.array(z.object({
    productA: z.string().describe("The first product in a frequently co-purchased pair."),
    productB: z.string().describe("The second product in a frequently co-purchased pair."),
  })).describe("A list of product pairs that are frequently bought together."),
  demandForecast: z.array(z.object({
    productName: z.string().describe("The name of the product."),
    predictedDemand: z.enum(['High', 'Medium', 'Low']).describe("The predicted future demand for the product."),
  })).describe("A list of products with their forecasted demand."),
});
export type SalesAnalysisOutput = z.infer<typeof SalesAnalysisOutputSchema>;

export async function analyzeSalesData(
  input: SalesAnalysisInput
): Promise<SalesAnalysisOutput> {
  return analyzeSalesDataFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'salesAnalysisPrompt',
  input: { schema: SalesAnalysisInputSchema },
  output: { schema: SalesAnalysisOutputSchema },
  prompt: `You are an expert data scientist specializing in retail analytics. Your task is to analyze the provided sales data to uncover insights.

Based on the sales transaction history below, perform two tasks:
1.  **Market Basket Analysis:** Identify pairs of products that are frequently purchased together in the same transaction. Focus on the most significant and non-obvious pairings.
2.  **Demand Forecasting:** Based on sales frequency and trends over time, predict the future demand for each of the top-selling products. Categorize the demand as 'High', 'Medium', or 'Low'.

Please provide your analysis in the structured JSON format requested.

Sales Data:
\`\`\`json
{{{json sales}}}
\`\`\`
`,
});

const analyzeSalesDataFlow = ai.defineFlow(
  {
    name: 'analyzeSalesDataFlow',
    inputSchema: SalesAnalysisInputSchema,
    outputSchema: SalesAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid analysis.');
    }
    return output;
  }
);
