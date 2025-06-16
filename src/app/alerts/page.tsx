import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Alerts | Scan2Sale',
};

export default function AlertsPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold">Alerts</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Notifications & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Alerts page is under construction. You will see low stock alerts and other important notifications here.
          </p>
          {/* Future alert listings can go here */}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
