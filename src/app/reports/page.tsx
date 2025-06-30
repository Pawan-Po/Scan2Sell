'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchSales, fetchExpenses } from '@/data/mock-data';
import type { SaleTransaction, Expense } from '@/lib/types';
import { LineChart, DollarSign, ShoppingBag, CreditCard, Calendar as CalendarIcon, Receipt, Scale } from 'lucide-react';
import { format, subDays } from 'date-fns';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';


interface DailySales {
  date: string;
  Sales: number;
}

interface ProductSales {
  name: string;
  Quantity: number;
}

interface PaymentMethodData {
    name: string;
    value: number;
    fill: string;
}

export default function ReportsPage() {
  const [sales, setSales] = React.useState<SaleTransaction[] | null>(null);
  const [expenses, setExpenses] = React.useState<Expense[] | null>(null);
  const [dataLoading, setDataLoading] = React.useState(true);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  React.useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      const [fetchedSales, fetchedExpenses] = await Promise.all([
        fetchSales(),
        fetchExpenses()
      ]);
      setSales(fetchedSales);
      setExpenses(fetchedExpenses);
      setDataLoading(false);
    };
    loadData();
  }, []);

  const reportData = React.useMemo(() => {
    if (!sales || !expenses) return null;

    const filterByDateRange = (items: (SaleTransaction | Expense)[]) => {
        if (!dateRange?.from) return items;
        return items.filter(item => {
            const itemDate = new Date(item.date);
            const from = new Date(dateRange.from!.setHours(0, 0, 0, 0));
            const to = dateRange.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)) : from;
            return itemDate >= from && itemDate <= to;
        });
    };

    const filteredSales = filterByDateRange(sales) as SaleTransaction[];
    const filteredExpenses = filterByDateRange(expenses) as Expense[];
    
    const paidSales = filteredSales.filter(s => s.status === 'paid');

    const totalRevenue = paidSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalTransactions = paidSales.length;
    const averageSaleValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    // Outstanding credit is calculated from ALL sales, not just the filtered ones
    const outstandingCredit = sales.filter(s => s.status === 'unpaid').reduce((sum, sale) => sum + sale.totalAmount, 0);

    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    const salesByDay: Record<string, number> = paidSales.reduce((acc, sale) => {
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

    const productPerformance: Record<string, { name: string; quantity: number }> = paidSales
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

    const paymentMethods = paidSales.reduce((acc, sale) => {
      const method = sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1);
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const paymentMethodData: PaymentMethodData[] = [
        { name: 'Cash', value: paymentMethods.Cash || 0, fill: 'hsl(var(--chart-1))' },
        { name: 'Credit', value: paymentMethods.Credit || 0, fill: 'hsl(var(--chart-2))' },
    ].filter(p => p.value > 0);


    return {
      totalRevenue,
      totalTransactions,
      averageSaleValue,
      outstandingCredit,
      totalExpenses,
      netProfit,
      dailySalesChartData,
      topSellingProducts,
      paymentMethodData,
      hasData: paidSales.length > 0 || filteredExpenses.length > 0,
    };
  }, [sales, expenses, dateRange]);


  if (dataLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-headline font-bold flex items-center">
            <LineChart className="mr-3 h-8 w-8 text-primary" /> Reports & Analytics
          </h1>
          <Skeleton className="h-10 w-full sm:w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
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

  if (!reportData) { // This case handles when sales data is fetched but is null/empty
    return (
       <AppLayout>
         <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-headline font-bold flex items-center">
            <LineChart className="mr-3 h-8 w-8 text-primary" /> Reports & Analytics
          </h1>
        </div>
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No data available to generate reports.</p>
            </CardContent>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-headline font-bold flex items-center shrink-0">
          <LineChart className="mr-3 h-8 w-8 text-primary" /> Reports & Analytics
        </h1>
        <div className="w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[260px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reportData.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From paid transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${reportData.totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                ${reportData.netProfit.toFixed(2)}
            </div>
             <p className="text-xs text-muted-foreground">Revenue - Expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Transactions</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalTransactions}</div>
             <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
             <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reportData.averageSaleValue.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground">For paid transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Credit</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${reportData.outstandingCredit.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground">Total across all time</p>
          </CardContent>
        </Card>
      </div>

    {!reportData.hasData ? (
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No data available for the selected date range.</p>
            </CardContent>
        </Card>
    ) : (
      <div className="grid gap-8 mt-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-5">
        <Card className="lg:col-span-1 xl:col-span-3">
            <CardHeader>
                <CardTitle>Daily Sales Revenue</CardTitle>
                 <p className="text-sm text-muted-foreground">For paid transactions in selected period</p>
            </CardHeader>
            <CardContent className="pl-2">
                <ChartContainer config={{
                    Sales: { label: "Sales", color: "hsl(var(--chart-1))" },
                }} className="h-[300px] w-full">
                <ResponsiveContainer>
                    <BarChart data={reportData.dailySalesChartData} margin={{ top: 20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="Sales" fill="hsl(var(--chart-1))" radius={4}>
                        <LabelList dataKey="Sales" position="top" offset={8} className="fill-foreground" fontSize={12} formatter={(value: number) => `$${value.toFixed(0)}`} />
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card className="lg:col-span-1 xl:col-span-2">
            <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <p className="text-sm text-muted-foreground">For paid transactions in selected period</p>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                 <ChartContainer config={{
                    cash: { label: "Cash", color: "hsl(var(--chart-1))"},
                    credit: { label: "Credit (Paid)", color: "hsl(var(--chart-2))"},
                 }} className="mx-auto aspect-square h-full max-h-[300px]">
                    <ResponsiveContainer>
                        <PieChart>
                             <Tooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie data={reportData.paymentMethodData} dataKey="value" nameKey="name" innerRadius="30%">
                                {reportData.paymentMethodData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                             <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                 </ChartContainer>
            </CardContent>
        </Card>

        <Card className="lg:col-span-2 xl:col-span-5">
            <CardHeader>
                <CardTitle>Top 5 Selling Products</CardTitle>
                 <p className="text-sm text-muted-foreground">By quantity sold in selected period</p>
            </CardHeader>
            <CardContent className="pr-0 pl-2">
                <ChartContainer config={{
                    Quantity: { label: "Quantity", color: "hsl(var(--chart-2))" },
                }} className="h-[300px] w-full">
                <ResponsiveContainer>
                    <BarChart data={reportData.topSellingProducts} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={5} width={110} tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 14)}...` : value} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="Quantity" fill="hsl(var(--chart-2))" radius={4}>
                        <LabelList dataKey="Quantity" position="right" offset={8} className="fill-foreground" fontSize={12} />
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    )}
    </AppLayout>
  );
}
