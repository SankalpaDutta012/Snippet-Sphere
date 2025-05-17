
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
import { PlusCircle, Search, FileText, Info, LogOut, UserPlus, LogIn } from "lucide-react"; // Added LogIn for consistency
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-provider";
import Link from "next/link";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { useRouter } from "next/navigation"; // For redirect

export default function DashboardPage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const { toast } = useToast();
  const { currentUser, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  // Auth check and redirect
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);
  
  const getLocalStorageKey = () => {
    // On dashboard, currentUser should always exist.
    // Fallback to a generic key if somehow it's null, though auth check should prevent this.
    return currentUser ? `snippetSphereSnippets_${currentUser.id}` : "snippetSphereSnippets_INVALID_USER";
  };
  
  // Load snippets from localStorage
  useEffect(() => {
    if (authLoading || !currentUser) return; 

    const storageKey = getLocalStorageKey();
    const storedSnippets = localStorage.getItem(storageKey);
    
    if (storedSnippets) {
      try {
        const parsedSnippets = JSON.parse(storedSnippets).map((s: Snippet) => ({...s, createdAt: new Date(s.createdAt)}));
        setSnippets(parsedSnippets);
      } catch (error) {
        console.error("Failed to parse snippets from localStorage", error);
        setSnippets([]); // Fallback to empty for the logged-in user
      }
    } else {
      setSnippets([]); // No snippets found for this user
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, authLoading]);

  // Save snippets to localStorage
  useEffect(() => {
    if (authLoading || !currentUser) return;
    
    const storageKey = getLocalStorageKey();
    // Always save, even if empty, to reflect the user's current state
    localStorage.setItem(storageKey, JSON.stringify(snippets));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snippets, currentUser, authLoading]);

  const handleAddOrUpdateSnippet = (data: { title: string; description?: string; code: string; tags?: string, language?: string }) => {
    // currentUser is guaranteed by auth check
    const snippetTags = data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(tag => tag) : [];
    
    if (editingSnippet) {
      setSnippets(prev => 
        prev.map(s => 
          s.id === editingSnippet.id 
          ? { ...s, ...data, tags: snippetTags, language: data.language || "", createdAt: new Date() } 
          : s
        )
      );
      toast({ title: "Snippet Updated", description: `"${data.title}" has been updated.`});
      setEditingSnippet(null);
    } else {
      const newSnippet: Snippet = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description || "",
        code: data.code,
        tags: snippetTags,
        language: data.language || "",
        createdAt: new Date(),
      };
      setSnippets(prev => [newSnippet, ...prev]);
      toast({ title: "Snippet Saved", description: `"${data.title}" has been saved.`});
    }
    setIsDialogOpen(false);
  };

  const handleDeleteSnippet = (id: string) => {
    // currentUser is guaranteed
    const snippetToDelete = snippets.find(s => s.id === id);
    if (snippetToDelete) {
      setSnippets(prev => prev.filter(s => s.id !== id));
      toast({ title: "Snippet Deleted", description: `"${snippetToDelete.title}" has been deleted.`, variant: "destructive"});
    }
  };

  const handleEditSnippet = (snippet: Snippet) => {
    // currentUser is guaranteed
    setEditingSnippet(snippet);
    setIsDialogOpen(true);
  };

  const openAddNewDialog = () => {
    // currentUser is guaranteed
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

  if (authLoading || !currentUser) {
    // Show loader or null while auth state is resolving or redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <Link href="/dashboard" className="text-3xl font-bold text-primary tracking-tight hover:opacity-80 transition-opacity">Snippet Sphere</Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            {currentUser && ( // This will always be true here
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">Hi, {currentUser.username}!</span>
                <Button onClick={openAddNewDialog} variant="default" size="sm" className="shadow hover:shadow-md transition-shadow">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Snippet
                </Button>
                <Button onClick={logout} variant="outline" size="sm" className="shadow-sm hover:shadow transition-shadow">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </>
            )}
          </div>
        </div>
         {currentUser && ( // Show Add Snippet button below header on small screens
            <div className="sm:hidden container mx-auto px-4 pb-3">
                 <Button onClick={openAddNewDialog} variant="default" className="w-full shadow hover:shadow-md transition-shadow">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add New Snippet
                  </Button>
            </div>
          )}
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 sticky top-[calc(var(--header-height,6rem)+1rem)] z-30 bg-background/80 backdrop-blur-sm py-4 -mx-4 px-4">
          {/* Calculate header height with JS if it's dynamic, or use a fixed known value if possible */}
          {/* For now, using a CSS variable placeholder, assuming header height is roughly 6rem on small screens with the extra button row */}
          <style jsx global>{`
            :root {
              --header-height: ${currentUser && typeof window !== 'undefined' && window.innerWidth < 640 ? 'calc(4rem + 32px + 2rem + 1rem)' : 'calc(4rem + 1rem)'};
            }
            @media (min-width: 640px) { /* sm breakpoint */
              :root {
                --header-height: calc(4rem + 1rem);
              }
            }
          `}</style>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search snippets by title, tag, content, or language..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 text-base py-3 h-12 rounded-lg shadow-sm focus-visible:ring-accent border-border focus:border-primary transition-colors"
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
          <div className="text-center py-12 bg-card rounded-lg shadow-md">
            <Info className="mx-auto h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-card-foreground">
              {searchTerm ? "No Snippets Found" : "Your Snippet Sphere is Empty"}
            </h2>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "No snippets match your search. Try different keywords!" 
                : "It looks like you haven't saved any snippets yet. Click 'Add Snippet' to get started!"
              }
            </p>
            {!searchTerm && (
                 <Button onClick={openAddNewDialog} variant="default" size="lg" className="mt-8 shadow hover:shadow-md transition-shadow">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Snippet
                </Button>
            )}
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingSnippet(null);
        }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingSnippet ? "Edit Snippet" : "Add New Snippet"}</DialogTitle>
            <DialogDescription>
              {editingSnippet ? "Update the details of your code snippet." : "Fill in the details to save your new code snippet."}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 -mr-4 py-1 flex-grow"> {/* Adjusted padding for scrollbar */}
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
        <p>&copy; {new Date().getFullYear()} Snippet Sphere. Happy Coding!</p>
      </footer>
    </div>
  );
}

// Simple loader component
function Loader2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
