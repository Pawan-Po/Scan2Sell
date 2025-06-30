'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { addExpense } from '@/data/mock-data';
import type { Expense } from '@/lib/types';
import { format } from 'date-fns';
import { RotateCcw, Save } from 'lucide-react';

const expenseFormSchema = z.object({
  description: z.string().min(2, { message: 'Description must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  category: z.string().min(2, { message: 'Category must be at least 2 characters.' }),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpensesClientProps {
  initialExpenses: Expense[];
  onExpenseAdded: () => void;
}

export function ExpensesClient({ initialExpenses, onExpenseAdded }: ExpensesClientProps) {
  const [expenses, setExpenses] = React.useState(initialExpenses);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: '',
      amount: 0,
      category: 'Miscellaneous',
    },
  });

  React.useEffect(() => {
    setExpenses(initialExpenses);
  }, [initialExpenses]);

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await addExpense({
        ...data,
      });
      toast({
        title: 'Expense Added!',
        description: `${data.description} has been successfully recorded.`,
      });
      reset();
      onExpenseAdded();
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expense. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <Card className="lg:col-span-1 shadow-lg sticky top-20">
        <CardHeader>
          <CardTitle>Add Expense</CardTitle>
          <CardDescription>Record a new business expense.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register('description')} placeholder="e.g., Office Supplies" />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" {...register('category')} placeholder="e.g., Supplies" />
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input id="amount" type="number" step="0.01" {...register('amount')} placeholder="0.00" />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting}>
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Card className="shadow-lg">
           <CardHeader>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>A list of all recorded expenses.</CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                 <p className="text-center text-muted-foreground py-8">No expenses recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div>
                            <p className="font-semibold">{expense.description}</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(expense.date), "PPP")} - <span className="italic">{expense.category}</span>
                            </p>
                        </div>
                        <p className="font-bold text-lg text-destructive">${expense.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
