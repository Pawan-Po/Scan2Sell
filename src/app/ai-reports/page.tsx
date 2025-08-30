'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { fetchSales } from '@/data/mock-data';
import type { SaleTransaction } from '@/lib/types';
import { analyzeSalesData, type SalesAnalysisOutput } from '@/ai/flows/analyze-sales-data';
import { getBusinessAdvice, type BusinessAdviceOutput } from '@/ai/flows/get-business-advice';
import { BrainCircuit, Wand2, ShoppingBasket, TrendingUp, AlertTriangle, Lightbulb, Bot } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AiReportsPage() {
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = React.useState<SalesAnalysisOutput | null>(null);
  const [adviceResult, setAdviceResult] = React.useState<BusinessAdviceOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAdviceLoading, setIsAdviceLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [salesData, setSalesData] = React.useState<SaleTransaction[] | null>(null);
  
  React.useEffect(() => {
    async function loadSales() {
        const sales = await fetchSales();
        setSalesData(sales);
    }
    loadSales();
  }, []);

  const handleRunAnalysis = async () => {
    if (!salesData) {
        toast({ title: 'Error', description: 'Sales data not loaded yet.', variant: 'destructive' });
        return;
    }
    
    if (salesData.length < 5) { // Check if there's enough data
        setError("There isn't enough sales data to perform a meaningful analysis. Please record more sales and try again.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setAdviceResult(null); // Reset advice on new analysis

    try {
      const result = await analyzeSalesData({ sales: salesData });
      setAnalysisResult(result);
    } catch (e) {
      console.error('AI analysis failed:', e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
      setError(`AI analysis failed. ${errorMessage}`);
      toast({
        title: 'AI Analysis Error',
        description: 'Could not complete the analysis. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAdvice = async () => {
    if (!analysisResult) {
      toast({ title: 'Error', description: 'Please run the initial analysis first.', variant: 'destructive' });
      return;
    }
    setIsAdviceLoading(true);
    setAdviceResult(null);
    try {
      const result = await getBusinessAdvice(analysisResult);
      setAdviceResult(result);
    } catch (e) {
      console.error('AI advice failed:', e);
      toast({
        title: 'AI Advice Error',
        description: 'Could not generate business advice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAdviceLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold flex items-center">
            <BrainCircuit className="mr-3 h-8 w-8 text-primary"/> AI-Powered Insights
        </h1>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Sales Data Analysis</CardTitle>
            <CardDescription>
                Click the button below to use AI to analyze your sales history. The model will identify which products are often purchased together (Market Basket Analysis) and predict future product demand.
            </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
             <Button onClick={handleRunAnalysis} disabled={isLoading || !salesData}>
                {isLoading ? (
                    <>
                        <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                       <Wand2 className="mr-2 h-4 w-4" />
                        Generate AI Insights
                    </>
                )}
            </Button>
        </CardContent>
      </Card>

      {error && (
         <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isLoading && (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
      )}

      {analysisResult && (
        <div className="space-y-6 mt-6">
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ShoppingBasket className="mr-2 h-5 w-5" />
                            Market Basket Analysis
                        </CardTitle>
                        <CardDescription>Products frequently purchased together.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analysisResult.marketBasketAnalysis.length > 0 ? (
                            <ul className="space-y-3">
                                {analysisResult.marketBasketAnalysis.map((pair, index) => (
                                    <li key={index} className="flex items-center p-3 rounded-lg bg-muted/50">
                                        <Lightbulb className="h-5 w-5 mr-3 text-primary flex-shrink-0"/>
                                        <p className="text-sm">Customers who bought <strong>{pair.productA}</strong> often also bought <strong>{pair.productB}</strong>.</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No strong purchasing patterns found.</p>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingUp className="mr-2 h-5 w-5" />
                            Demand Forecasting
                        </CardTitle>
                         <CardDescription>Predictions for future product demand.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analysisResult.demandForecast.length > 0 ? (
                            <ul className="space-y-3">
                                 {analysisResult.demandForecast.map((forecast, index) => (
                                    <li key={index} className="flex items-center p-3 rounded-lg bg-muted/50">
                                         <Lightbulb className="h-5 w-5 mr-3 text-primary flex-shrink-0"/>
                                         <p className="text-sm">
                                            Demand for <strong>{forecast.productName}</strong> is predicted to be{' '}
                                            <span className={`font-semibold ${
                                                forecast.predictedDemand === 'High' ? 'text-green-600' :
                                                forecast.predictedDemand === 'Low' ? 'text-red-600' : ''
                                            }`}>
                                                {forecast.predictedDemand.toLowerCase()}
                                            </span>.
                                         </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-sm text-muted-foreground">Could not forecast demand from the current data.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <Card className="shadow-lg border-primary border-2">
                <CardHeader>
                    <CardTitle>Get Strategic Advice</CardTitle>
                    <CardDescription>Based on the analysis above, the AI can generate actionable business strategies for marketing, inventory, and sales.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button onClick={handleGetAdvice} disabled={isAdviceLoading}>
                        {isAdviceLoading ? (
                            <>
                                <Bot className="mr-2 h-4 w-4 animate-spin" />
                                Generating Advice...
                            </>
                        ) : (
                            <>
                               <Bot className="mr-2 h-4 w-4" />
                                Get Business Advice
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {isAdviceLoading && (
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            )}

            {adviceResult && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Bot className="mr-2 h-5 w-5" />
                            Business Strategy Recommendations
                        </CardTitle>
                        <CardDescription>Actionable advice from your AI business consultant.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {adviceResult.advice.length > 0 ? (
                            <ul className="space-y-4">
                                {adviceResult.advice.map((item, index) => (
                                    <li key={index} className="p-4 rounded-lg bg-muted/50">
                                        <p className="font-semibold text-primary-dark">{item.recommendation}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{item.reasoning}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-sm text-muted-foreground">No specific advice could be generated from the data.</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
      )}

    </AppLayout>
  );
}
