'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

export function AppHeader() {
  const pathname = usePathname();

  const getTitle = (path: string) => {
    const routeName = path.split('/').pop() || 'inventory';
    if (path.startsWith('/inventory/add')) return 'Add Product';
    if (path.startsWith('/inventory')) return 'Inventory';
    if (path.startsWith('/pos')) return 'Point of Sale';
    
    // Capitalize the first letter for other routes
    return routeName.charAt(0).toUpperCase() + routeName.slice(1);
  };


  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
         <h1 className="text-xl font-semibold md:hidden">{getTitle(pathname)}</h1>
      </div>
    </header>
  );
}
