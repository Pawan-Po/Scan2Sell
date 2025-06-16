'use client';
import { useAuth } from '@/hooks/use-auth';
import { signOutUser } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, Mail, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function ProfileClient() {
  const { user } = useAuth(); // Loading state is handled by ProfilePage
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.push('/login');
    } catch (error) {
      toast({ title: 'Sign Out Error', description: 'Failed to sign out. Please try again.', variant: 'destructive' });
    }
  };

  if (!user) {
    // This case should be rare if ProfilePage handles redirection correctly
    // but acts as a fallback.
    return (
        <div className="flex items-center justify-center h-full">
         <p>User not found. You might be logged out.</p>
        </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="items-center text-center pb-8">
        <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
          <AvatarFallback className="text-3xl">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon size={48} />}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="font-headline text-3xl">{user.displayName || 'Anonymous User'}</CardTitle>
        {user.email && (
          <CardDescription className="flex items-center justify-center text-muted-foreground">
            <Mail className="mr-2 h-4 w-4" /> {user.email}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Account Details</h3>
            <ul className="list-disc list-inside space-y-1 text-sm bg-muted/50 p-4 rounded-md">
                <li>User ID: <span className="font-mono text-xs">{user.uid}</span></li>
                <li>Provider: <span className="capitalize">{user.providerData[0]?.providerId.split('.')[0] || 'N/A'}</span></li>
                <li>Account Created: {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</li>
                <li>Last Sign In: {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A'}</li>
            </ul>
        </div>
         <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Organization (Placeholder)</h3>
            <div className="flex items-center p-4 rounded-md border bg-card">
                <Building className="mr-3 h-6 w-6 text-primary" />
                <div>
                    <p className="font-semibold">Your Company Name</p>
                    <p className="text-xs text-muted-foreground">Feature to manage organization details coming soon.</p>
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button onClick={handleSignOut} variant="destructive" className="w-full sm:w-auto ml-auto">
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
}
