import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { AppHeader } from './app-header';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <SidebarNav />
      <div className="flex flex-col flex-1 min-h-screen">
        <AppHeader />
        <SidebarInset>
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
