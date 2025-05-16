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
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Search, FileText, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dummy data for initial state
const initialSnippets: Snippet[] = [
  {
    id: "1",
    title: "React Counter Hook",
    description: "A simple custom hook for managing a counter state in React.",
    code: `import { useState, useCallback } from 'react';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  return { count, increment, decrement, reset };
}`,
    tags: ["react", "hook", "counter", "javascript"],
    createdAt: new Date("2023-10-01T10:00:00Z"),
    language: "javascript",
  },
  {
    id: "2",
    title: "Python Dictionary Iteration",
    description: "How to iterate over keys, values, and items in a Python dictionary.",
    code: `my_dict = {'a': 1, 'b': 2, 'c': 3}

# Iterate over keys
for key in my_dict:
    print(key)

# Iterate over values
for value in my_dict.values():
    print(value)

# Iterate over items (key-value pairs)
for key, value in my_dict.items():
    print(f"{key}: {value}")`,
    tags: ["python", "dictionary", "iteration"],
    createdAt: new Date("2023-10-05T14:30:00Z"),
    language: "python",
  },
];


export default function HomePage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const { toast } = useToast();
  
  // Load snippets from localStorage on mount, or use initialSnippets
  useEffect(() => {
    const storedSnippets = localStorage.getItem("snippetSphereSnippets");
    if (storedSnippets) {
      try {
        const parsedSnippets = JSON.parse(storedSnippets).map((s: Snippet) => ({...s, createdAt: new Date(s.createdAt)}));
        setSnippets(parsedSnippets);
      } catch (error) {
        console.error("Failed to parse snippets from localStorage", error);
        setSnippets(initialSnippets); // Fallback to initial data
      }
    } else {
      setSnippets(initialSnippets);
    }
  }, []);

  // Save snippets to localStorage whenever they change
  useEffect(() => {
    if (snippets.length > 0 || localStorage.getItem("snippetSphereSnippets")) { // Avoid writing initial empty array if nothing was stored
      localStorage.setItem("snippetSphereSnippets", JSON.stringify(snippets));
    }
  }, [snippets]);

  const handleAddOrUpdateSnippet = (data: { title: string; description?: string; code: string; tags?: string, language?: string }) => {
    const snippetTags = data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(tag => tag) : [];
    
    if (editingSnippet) {
      // Update existing snippet
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
      // Add new snippet
      const newSnippet: Snippet = {
        id: Date.now().toString(),
        ...data,
        tags: snippetTags,
        createdAt: new Date(),
      };
      setSnippets(prev => [newSnippet, ...prev]); // Add to the beginning
      toast({ title: "Snippet Saved", description: `"${data.title}" has been saved.`});
    }
    setIsDialogOpen(false);
  };

  const handleDeleteSnippet = (id: string) => {
    const snippetToDelete = snippets.find(s => s.id === id);
    if (snippetToDelete) {
      setSnippets(prev => prev.filter(s => s.id !== id));
      toast({ title: "Snippet Deleted", description: `"${snippetToDelete.title}" has been deleted.`, variant: "destructive"});
    }
  };

  const handleEditSnippet = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setIsDialogOpen(true);
  };

  const openAddNewDialog = () => {
    setEditingSnippet(null); // Ensure we are in "add" mode
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
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }, [snippets, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary tracking-tight">Snippet Sphere</h1>
          </div>
          <Button onClick={openAddNewDialog} variant="default" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Snippet
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 sticky top-[calc(4rem+32px-1px)] sm:top-[calc(4rem+16px-1px)] z-30 bg-background py-4"> {/* Adjust top based on header height */}
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
            <h2 className="text-2xl font-semibold mb-2">No Snippets Found</h2>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search term." : "Get started by adding a new snippet!"}
            </p>
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingSnippet(null); // Reset editing state when dialog closes
        }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingSnippet ? "Edit Snippet" : "Add New Snippet"}</DialogTitle>
            <DialogDescription>
              {editingSnippet ? "Update the details of your code snippet." : "Fill in the details to save your new code snippet."}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 -mr-3 py-1 flex-grow"> {/* Custom scrollbar handling */}
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
