'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchSales } from '@/data/mock-data';
import type { SaleTransaction } from '@/lib/types';
import { LineChart, DollarSign, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface DailySales {
  date: string;
  Sales: number;
}

interface ProductSales {
  name: string;
  Quantity: number;
}

export default function ReportsPage() {
  const [sales, setSales] = React.useState<SaleTransaction[] | null>(null);
  const [dataLoading, setDataLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      const fetchedSales = await fetchSales();
      setSales(fetchedSales);
      setDataLoading(false);
    };
    loadData();
  }, []);

  const reportData = React.useMemo(() => {
    if (!sales || sales.length === 0) return null;

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalSales = sales.length;
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    const salesByDay: Record<string, number> = sales.reduce((acc, sale) => {
      const day = format(new Date(sale.date), 'yyyy-MM-dd');
      acc[day] = (acc[day] || 0) + sale.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    const dailySalesChartData: DailySales[] = Object.entries(salesByDay)
      .map(([date, total]) => ({
        date: format(new Date(date), 'MMM d'),
        Sales: total,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const productPerformance: Record<string, { name: string; quantity: number }> = sales
      .flatMap(sale => sale.items)
      .reduce((acc, item) => {
        if (!acc[item.id]) {
          acc[item.id] = { name: item.name, quantity: 0 };
        }
        acc[item.id].quantity += item.cartQuantity;
        return acc;
      }, {} as Record<string, { name: string; quantity: number }>);
    
    const topSellingProducts: ProductSales[] = Object.values(productPerformance)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(p => ({ name: p.name, Quantity: p.quantity }));

    return {
      totalRevenue,
      totalSales,
      averageSaleValue,
      dailySalesChartData,
      topSellingProducts,
    };
  }, [sales]);


  if (dataLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-headline font-bold flex items-center">
            <LineChart className="mr-3 h-8 w-8 text-primary" /> Reports & Analytics
          </h1>
        </div>
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!reportData) {
    return (
       <AppLayout>
         <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-headline font-bold flex items-center">
            <LineChart className="mr-3 h-8 w-8 text-primary" /> Reports & Analytics
          </h1>
        </div>
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No sales data available to generate reports.</p>
            </CardContent>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold flex items-center">
          <LineChart className="mr-3 h-8 w-8 text-primary" /> Reports & Analytics
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reportData.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale Value</CardTitle>
             <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reportData.averageSaleValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>Daily Sales Revenue</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={{
                Sales: {
                    label: "Sales",
                    color: "hsl(var(--primary))",
                },
            }} className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={reportData.dailySalesChartData} margin={{ top: 20 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="Sales" fill="hsl(var(--primary))" radius={4}>
                     <LabelList dataKey="Sales" position="top" offset={8} className="fill-foreground" fontSize={12} formatter={(value: number) => `$${value.toFixed(0)}`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="pr-0 pl-2">
            <ChartContainer config={{
                Quantity: {
                    label: "Quantity",
                    color: "hsl(var(--accent))",
                },
            }} className="h-[300px] w-full">
               <ResponsiveContainer>
                <BarChart data={reportData.topSellingProducts} layout="vertical" margin={{ left: 10, right: 30 }}>
                   <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={5}
                    width={110}
                    tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 14)}...` : value}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="Quantity" fill="hsl(var(--accent))" radius={4}>
                    <LabelList dataKey="Quantity" position="right" offset={8} className="fill-foreground" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
