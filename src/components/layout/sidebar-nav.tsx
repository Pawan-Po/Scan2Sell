
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, PlusCircle, ShoppingCart, Settings, AlertTriangle, DollarSign, CreditCard } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
// import { useAuth } from '@/hooks/use-auth'; // Auth removed for now
import { Skeleton } from '@/components/ui/skeleton';

const navItemsBase = [
  { href: '/inventory', label: 'Inventory', icon: LayoutGrid },
  { href: '/inventory/add', label: 'Add Product', icon: PlusCircle },
  { href: '/pos', label: 'POS', icon: ShoppingCart },
  { href: '/sales', label: 'Sales', icon: DollarSign },
  { href: '/credit', label: 'Credit', icon: CreditCard },
];

const bottomNavItemsBase = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
];

export function SidebarNav() {
  const pathname = usePathname();
  // const { user, loading } = useAuth(); // Auth removed for now
  const loading = false; // Simulate not loading as auth is removed

  if (loading) { // This block will likely not be hit as loading is false
    return (
      <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
        <SidebarHeader className="p-4 items-center">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-6 w-24 group-data-[collapsible=icon]:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-grow p-2 space-y-1">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-md" />)}
        </SidebarContent>
        <SidebarFooter className="p-2 space-y-1">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-md" />)}
        </SidebarFooter>
      </Sidebar>
    );
  }

  // Since auth is removed, we show all base items
  const navItems = navItemsBase;
  const dynamicBottomNavItems = bottomNavItemsBase; // Profile link removed

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
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
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                  tooltip={item.label}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          {dynamicBottomNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
               <Link href={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className="justify-start"
                  variant="ghost"
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
