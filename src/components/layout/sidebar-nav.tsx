'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, PlusCircle, ShoppingCart, Settings, AlertTriangle, DollarSign, CreditCard, MoreHorizontal, LineChart } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/icons/logo';
import { cn } from '@/lib/utils';


const navItemsBase = [
  { href: '/inventory', label: 'Inventory', icon: LayoutGrid },
  { href: '/inventory/add', label: 'Add Item', icon: PlusCircle },
  { href: '/pos', label: 'POS', icon: ShoppingCart },
  { href: '/sales', label: 'Sales', icon: DollarSign },
  { href: '/credit', label: 'Credit', icon: CreditCard },
  { href: '/reports', label: 'Reports', icon: LineChart },
];

const bottomNavItemsBase = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
];


function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r hidden md:flex">
      <SidebarHeader className="p-4 items-center">
        <Link href={"/inventory"} className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
            Scan2Sale
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {navItemsBase.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
                className="justify-start"
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          {bottomNavItemsBase.map((item) => (
            <SidebarMenuItem key={item.href}>
               <SidebarMenuButton
                 asChild
                 isActive={pathname === item.href}
                 tooltip={item.label}
                 className="justify-start"
                 variant="ghost"
               >
                 <Link href={item.href}>
                   <item.icon className="h-5 w-5" />
                   <span>{item.label}</span>
                 </Link>
               </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function MobileBottomNav() {
    const pathname = usePathname();
    const mainNavItems = navItemsBase.slice(0, 4);
    const moreNavItems = [...navItemsBase.slice(4), ...bottomNavItemsBase];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
            <div className="grid h-full grid-cols-5 mx-auto">
                {mainNavItems.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "inline-flex flex-col items-center justify-center px-2 sm:px-4 hover:bg-muted/50",
                             pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <item.icon className="w-6 h-6 mb-1" />
                        <span className="text-xs">{item.label}</span>
                    </Link>
                ))}

                <Sheet>
                    <SheetTrigger asChild>
                         <button
                            type="button"
                            className="inline-flex flex-col items-center justify-center px-2 sm:px-4 hover:bg-muted/50 text-muted-foreground"
                        >
                            <MoreHorizontal className="w-6 h-6 mb-1" />
                            <span className="text-xs">More</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-auto">
                         <div className="grid grid-cols-3 gap-4 p-4">
                            {moreNavItems.map(item => (
                                 <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-2 rounded-lg hover:bg-muted",
                                        pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    <item.icon className="w-6 h-6 mb-1" />
                                    <span className="text-sm text-center">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>

            </div>
        </nav>
    );
}

export function SidebarNav() {
  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
    </>
  );
}
