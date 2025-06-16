import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export const metadata = {
  title: 'Settings | Scan2Sale',
};

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Application Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings page is under construction. Check back later for more options!
          </p>
          {/* Future settings options can go here */}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
