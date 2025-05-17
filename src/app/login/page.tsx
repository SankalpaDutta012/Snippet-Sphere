
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FileText, LogIn, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // Mock password, not actually used
  const { login, currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (!authLoading && currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // In a real app, you'd validate password too
    if (username) {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      login(username);
      // login() will redirect, so no need to setIsSubmitting(false) if successful
    } else {
      // Handle error - though browser validation should catch empty username
      setIsSubmitting(false);
    }
  };

  if (authLoading || currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4 selection:bg-accent/30 selection:text-accent-foreground">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
          <FileText className="h-7 w-7" />
          <span className="text-2xl font-semibold">Snippet Sphere</span>
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-xl rounded-lg border-border/50">
        <CardHeader className="text-center p-6">
          <CardTitle className="text-3xl font-bold flex items-center justify-center text-primary">
            <LogIn className="mr-2.5 h-7 w-7" /> Login
          </CardTitle>
          <CardDescription className="text-md mt-1">Access your saved code snippets.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="h-12 text-base rounded-md border-border focus:border-primary transition-colors"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password (mock)"
                required
                className="h-12 text-base rounded-md border-border focus:border-primary transition-colors"
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base rounded-md shadow hover:shadow-md transition-shadow" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
              {isSubmitting ? "Logging In..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 p-6 border-t text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
       <footer className="absolute bottom-6 text-center text-sm text-muted-foreground/80">
          <p>&copy; {new Date().getFullYear()} Snippet Sphere.</p>
        </footer>
    </div>
  );
}
