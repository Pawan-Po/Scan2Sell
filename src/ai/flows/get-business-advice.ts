'use server';

/**
 * @fileOverview AI flow to generate business advice based on sales analysis.
 *
 * - getBusinessAdvice - A function that provides strategic business recommendations.
 * - BusinessAdviceInput - The input type for the getBusinessAdvice function.
 * - BusinessAdviceOutput - The return type for the getBusinessAdvice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { SalesAnalysisOutput } from './analyze-sales-data';

// Using the existing SalesAnalysisOutput as the input for this flow.
export type BusinessAdviceInput = SalesAnalysisOutput;

const BusinessAdviceOutputSchema = z.object({
  advice: z.array(z.object({
    recommendation: z.string().describe("A specific, actionable business recommendation."),
    reasoning: z.string().describe("The reasoning behind the recommendation, citing the provided data.")
  })).describe("A list of strategic business advice.")
});
export type BusinessAdviceOutput = z.infer<typeof BusinessAdviceOutputSchema>;

export async function getBusinessAdvice(
  input: BusinessAdviceInput
): Promise<BusinessAdviceOutput> {
  return getBusinessAdviceFlow(input);
}

const advicePrompt = ai.definePrompt({
  name: 'businessAdvicePrompt',
  input: { schema: z.custom<BusinessAdviceInput>() },
  output: { schema: BusinessAdviceOutputSchema },
  prompt: `You are an expert business consultant for a small retail shop.
You have been provided with a data analysis of the shop's recent sales. Your task is to provide actionable business strategies based on this analysis.

Focus on practical advice related to marketing, inventory management, and sales strategies. For each piece of advice, clearly state the recommendation and the reasoning based on the data.

Here is the sales analysis data:

**Market Basket Analysis (Frequently Bought Together):**
{{{json marketBasketAnalysis}}}

**Demand Forecasting:**
{{{json demandForecast}}}

Please provide your strategic recommendations in the structured JSON format requested.`,
});

const getBusinessAdviceFlow = ai.defineFlow(
  {
    name: 'getBusinessAdviceFlow',
    inputSchema: z.custom<BusinessAdviceInput>(),
    outputSchema: BusinessAdviceOutputSchema,
  },
  async (input) => {
    const { output } = await advicePrompt(input);
    if (!output) {
      throw new Error('The AI model did not return any business advice.');
    }
    return output;
  }
);
