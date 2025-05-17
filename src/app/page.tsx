
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Snippet } from "@/types";
import SnippetCard from "@/components/snippet-card";
import SnippetForm from "@/components/snippet-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PlusCircle, Search, FileText, Info, LogIn, LogOut, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-provider";
import Link from "next/link";
import { ThemeToggleButton } from "@/components/theme-toggle-button";

// Dummy data for initial state (for guests or if localStorage fails)
const initialGuestSnippets: Snippet[] = [
  {
    id: "guest-1",
    title: "Welcome Snippet",
    description: "This is a default snippet visible to guests. Log in to save your own!",
    code: `console.log("Hello, Guest!");`,
    tags: ["welcome", "guest"],
    createdAt: new Date("2023-01-01T10:00:00Z"),
    language: "javascript",
  },
];

export default function HomePage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const { toast } = useToast();
  const { currentUser, logout, loading } = useAuth();

  const getLocalStorageKey = () => {
    return currentUser ? `snippetSphereSnippets_${currentUser.id}` : "snippetSphereSnippets_guest";
  };
  
  // Load snippets from localStorage on mount, or use initialSnippets
  useEffect(() => {
    if (loading) return; // Don't load snippets until auth state is resolved

    const storageKey = getLocalStorageKey();
    const storedSnippets = localStorage.getItem(storageKey);
    
    if (storedSnippets) {
      try {
        const parsedSnippets = JSON.parse(storedSnippets).map((s: Snippet) => ({...s, createdAt: new Date(s.createdAt)}));
        setSnippets(parsedSnippets);
      } catch (error) {
        console.error("Failed to parse snippets from localStorage", error);
        setSnippets(currentUser ? [] : initialGuestSnippets); // Fallback
      }
    } else {
      setSnippets(currentUser ? [] : initialGuestSnippets);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, loading]); // Rerun when user or loading state changes

  // Save snippets to localStorage whenever they change
  useEffect(() => {
    if (loading) return;
    // Avoid writing initial empty array if nothing was stored, unless user is logged in and has no snippets
    const storageKey = getLocalStorageKey();
    if (snippets.length > 0 || (currentUser && snippets.length === 0 && localStorage.getItem(storageKey))) { 
      localStorage.setItem(storageKey, JSON.stringify(snippets));
    } else if (!currentUser && snippets.length === 0 && !localStorage.getItem(storageKey)) {
      // If guest and no snippets and nothing in local storage, don't write empty array
      // This preserves initialGuestSnippets if user clears local storage manually
    } else {
      localStorage.setItem(storageKey, JSON.stringify(snippets));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snippets, currentUser, loading]);

  const handleAddOrUpdateSnippet = (data: { title: string; description?: string; code: string; tags?: string, language?: string }) => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to save snippets.", variant: "destructive" });
      return;
    }
    const snippetTags = data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(tag => tag) : [];
    
    if (editingSnippet) {
      setSnippets(prev => 
        prev.map(s => 
          s.id === editingSnippet.id 
          ? { ...s, ...data, tags: snippetTags, createdAt: new Date() } 
          : s
        )
      );
      toast({ title: "Snippet Updated", description: `"${data.title}" has been updated.`});
      setEditingSnippet(null);
    } else {
      const newSnippet: Snippet = {
        id: Date.now().toString(),
        ...data,
        tags: snippetTags,
        createdAt: new Date(),
      };
      setSnippets(prev => [newSnippet, ...prev]);
      toast({ title: "Snippet Saved", description: `"${data.title}" has been saved.`});
    }
    setIsDialogOpen(false);
  };

  const handleDeleteSnippet = (id: string) => {
    if (!currentUser) return;
    const snippetToDelete = snippets.find(s => s.id === id);
    if (snippetToDelete) {
      setSnippets(prev => prev.filter(s => s.id !== id));
      toast({ title: "Snippet Deleted", description: `"${snippetToDelete.title}" has been deleted.`, variant: "destructive"});
    }
  };

  const handleEditSnippet = (snippet: Snippet) => {
    if (!currentUser) return;
    setEditingSnippet(snippet);
    setIsDialogOpen(true);
  };

  const openAddNewDialog = () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to add a new snippet.", variant: "destructive" });
      return;
    }
    setEditingSnippet(null);
    setIsDialogOpen(true);
  }

  const filteredSnippets = useMemo(() => {
    return snippets
      .filter(snippet => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
          snippet.title.toLowerCase().includes(lowerSearchTerm) ||
          (snippet.description && snippet.description.toLowerCase().includes(lowerSearchTerm)) ||
          snippet.code.toLowerCase().includes(lowerSearchTerm) ||
          snippet.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)) ||
          (snippet.language && snippet.language.toLowerCase().includes(lowerSearchTerm))
        );
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [snippets, searchTerm]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading application...</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary tracking-tight">Snippet Sphere</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            {currentUser ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">Hi, {currentUser.username}!</span>
                <Button onClick={openAddNewDialog} variant="default" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Snippet
                </Button>
                <Button onClick={logout} variant="outline" size="sm">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Login</Link>
                </Button>
                <Button asChild variant="default" size="sm">
                  <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" /> Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
         {currentUser && ( // Show Add Snippet button below header on small screens when logged in
            <div className="sm:hidden container mx-auto px-4 pb-3">
                 <Button onClick={openAddNewDialog} variant="default" className="w-full">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add New Snippet
                  </Button>
            </div>
          )}
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 sticky top-[calc(4rem+32px-1px+2rem)] sm:top-[calc(4rem+1rem-1px)] z-30 bg-background py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search snippets by title, tag, content, or language..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 text-base py-3 h-12 rounded-lg shadow-sm focus-visible:ring-accent"
            />
          </div>
        </div>

        {filteredSnippets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSnippets.map(snippet => (
              <SnippetCard key={snippet.id} snippet={snippet} onDelete={handleDeleteSnippet} onEdit={handleEditSnippet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Info className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {currentUser ? "No Snippets Yet" : "Welcome to Snippet Sphere!"}
            </h2>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Try adjusting your search term." 
                : currentUser
                  ? "Get started by adding a new snippet!"
                  : "Log in or sign up to save and manage your code snippets."
              }
            </p>
             {!currentUser && (
                <div className="mt-6 flex justify-center gap-4">
                    <Button asChild variant="default">
                        <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Login</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" /> Sign Up</Link>
                    </Button>
                </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!currentUser && open) {
            setIsDialogOpen(false); // Prevent opening if not logged in
            toast({ title: "Login Required", description: "Please log in to manage snippets.", variant: "destructive" });
            return;
          }
          setIsDialogOpen(open);
          if (!open) setEditingSnippet(null);
        }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingSnippet ? "Edit Snippet" : "Add New Snippet"}</DialogTitle>
            <DialogDescription>
              {editingSnippet ? "Update the details of your code snippet." : "Fill in the details to save your new code snippet."}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 -mr-3 py-1 flex-grow">
            <SnippetForm 
              onSubmit={handleAddOrUpdateSnippet} 
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingSnippet(null);
              }}
              initialData={editingSnippet} 
            />
          </div>
        </DialogContent>
      </Dialog>

      <footer className="bg-card border-t py-6 text-center text-sm text-muted-foreground mt-auto">
        <p>&copy; {new Date().getFullYear()} Snippet Sphere. All rights reserved.</p>
      </footer>
    </div>
  );
}
