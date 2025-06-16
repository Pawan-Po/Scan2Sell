'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, PlusCircle, ShoppingCart, Settings, AlertTriangle, UserCircle, LogIn } from 'lucide-react';
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
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

const navItemsBase = [
  { href: '/inventory', label: 'Inventory', icon: LayoutGrid },
  { href: '/inventory/add', label: 'Add Product', icon: PlusCircle },
  { href: '/pos', label: 'POS', icon: ShoppingCart },
];

const bottomNavItemsBase = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
        <SidebarHeader className="p-4 items-center">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-6 w-24 group-data-[collapsible=icon]:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-grow p-2 space-y-1">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-md" />)}
        </SidebarContent>
        <SidebarFooter className="p-2 space-y-1">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-md" />)}
        </SidebarFooter>
      </Sidebar>
    );
  }

  // Determine navigation items based on auth state
  const navItems = user ? navItemsBase : []; // Show main nav only if logged in
  
  let dynamicBottomNavItems = [];
  if (user) {
    dynamicBottomNavItems = [{ href: '/profile', label: 'Profile', icon: UserCircle }, ...bottomNavItemsBase];
  } else {
    // Optionally, show a Login link if not logged in, if the sidebar is visible on login pages
    // For this app, login/signup pages are standalone, so sidebar won't usually show there.
    // If it could, this would be the place:
    // dynamicBottomNavItems = [{ href: '/login', label: 'Login', icon: LogIn }];
    dynamicBottomNavItems = bottomNavItemsBase; // Or keep settings/alerts if they are public
  }


  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
      <SidebarHeader className="p-4 items-center">
        <Link href={user ? "/inventory" : "/login"} className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
            Scan2Sale
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2">
        {user && ( // Only show main navigation if user is logged in
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
        )}
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
