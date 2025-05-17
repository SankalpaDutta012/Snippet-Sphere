
"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FileText, UserPlus } from "lucide-react";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // Mock password
  const [confirmPassword, setConfirmPassword] = useState(""); // Mock confirm password
  const { signup } = useAuth();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Add mock validation if desired, e.g., password match
    if (username && password && password === confirmPassword) {
      signup(username);
    } else if (password !== confirmPassword) {
        alert("Passwords do not match (mock validation).");
    } else {
        alert("Please fill in all fields (mock validation).");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center space-x-2 text-primary hover:underline">
          <FileText className="h-6 w-6" />
          <span className="text-xl font-bold">Snippet Sphere</span>
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center">
             <UserPlus className="mr-2 h-6 w-6" /> Sign Up
          </CardTitle>
          <CardDescription>Create an account to save your snippets.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (mock)"
                required
                className="h-12 text-base"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password (mock)"
                required
                className="h-12 text-base"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
