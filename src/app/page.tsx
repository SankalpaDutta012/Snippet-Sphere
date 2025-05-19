
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, LogIn, UserPlus, Lightbulb, Loader2 } from 'lucide-react'; // Added Loader2

export default function LandingPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading Snippet Sphere...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-6 selection:bg-accent/30 selection:text-accent-foreground">
        <main className="flex flex-col items-center justify-center flex-grow">
          <Card className="w-full max-w-xl text-center shadow-2xl rounded-xl border-border/50 transform hover:scale-[1.02] transition-transform duration-300 ease-out">
            <CardHeader className="p-8">
              <div className="mx-auto bg-primary/10 p-5 rounded-full mb-6 w-fit ring-4 ring-primary/20">
                <FileText className="h-20 w-20 text-primary" />
              </div>
              <CardTitle className="text-5xl font-extrabold tracking-tight text-primary">
                Snippet Sphere
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground mt-3 max-w-md mx-auto">
                Your personal command center for code snippets. Save, search, and soar.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <p className="text-lg text-foreground/90 mb-8">
                Never lose a brilliant piece of code again. Sign up to craft your library, or log in to dive back into your organized snippets.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button asChild size="lg" className="text-lg py-7 px-8 shadow-lg hover:shadow-xl bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-1">
                  <Link href="/login">
                    <LogIn className="mr-2.5 h-6 w-6" /> Login
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg py-7 px-8 shadow-lg hover:shadow-xl border-primary text-primary hover:bg-primary/10 hover:border-primary/80 transition-all duration-300 transform hover:-translate-y-1">
                  <Link href="/signup">
                    <UserPlus className="mr-2.5 h-6 w-6" /> Sign Up
                  </Link>
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center p-6 bg-muted/50 rounded-b-xl border-t">
              <Lightbulb className="h-7 w-7 text-accent mb-2 animate-pulse" />
              <p className="text-sm text-muted-foreground">Unlock your coding potential today!</p>
            </CardFooter>
          </Card>
        </main>
        <footer className="py-8 text-center text-sm text-muted-foreground/80">
          <p>&copy; {new Date().getFullYear()} Snippet Sphere. Crafted for coders.</p>
        </footer>
      </div>
    );
  }

  // Fallback for when currentUser exists but redirection hasn't happened yet
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">Redirecting to your dashboard...</p>
    </div>
  );
}

// Removed inline Loader2 SVG component definition
