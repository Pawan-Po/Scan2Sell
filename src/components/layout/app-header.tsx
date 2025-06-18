'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { UserCircle, LogIn, LogOut, Settings, LayoutDashboard } from 'lucide-react';
// import { useAuth } from '@/hooks/use-auth';
// import Link from 'next/link';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { signOutUser } from '@/lib/firebase/auth';
// import { useRouter } from 'next/navigation';
// import { useToast } from '@/hooks/use-toast';
// import { Skeleton } from '@/components/ui/skeleton';

export function AppHeader() {
  // const { user, loading } = useAuth(); // Auth removed for now
  // const router = useRouter();
  // const { toast } = useToast();

  // const handleSignOut = async () => {
  //   try {
  //     await signOutUser();
  //     toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
  //     router.push('/login'); // Login page removed
  //   } catch (error) {
  //      toast({ title: 'Sign Out Error', description: 'Failed to sign out.', variant: 'destructive' });
  //   }
  // };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* Placeholder for breadcrumbs or page title if needed */}
      </div>
      {/* User avatar and login button removed as auth is disabled for now */}
    </header>
  );
}
