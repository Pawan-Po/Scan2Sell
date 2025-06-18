'use client';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Chrome } from 'lucide-react'; // Using Chrome icon as a placeholder for Google

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      // If signInWithGoogle is successful, user should be defined.
      toast({ title: 'Login Successful', description: `Welcome back, ${user.displayName || 'User'}!` });
      router.push('/inventory'); // Or a dedicated dashboard page
    } catch (error) {
      console.error("Google Sign-In Error Object:", error);
      let errorMessage = 'Could not sign in with Google. Please try again or check your Firebase setup.'; // More informative default
      if (error instanceof Error) {
        errorMessage = error.message; // This will now get the more specific message from auth.ts
      }
      toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <Button onClick={handleGoogleSignIn} className="w-full max-w-sm" variant="outline">
        <Chrome className="mr-2 h-5 w-5" />
        Sign in with Google
      </Button>
      {/* You can add more OAuth providers or traditional email/password form here */}
      <p className="px-8 text-center text-sm text-muted-foreground">
        By clicking continue, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
