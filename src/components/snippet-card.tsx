
"use client";

import type { Snippet } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ClipboardCopy, Download, Trash2, Pencil, Lightbulb, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { explainCode } from "@/ai/flows/explain-code-flow";

interface SnippetCardProps {
  snippet: Snippet;
  onDelete: (id: string) => void;
  onEdit: (snippet: Snippet) => void;
}

export default function SnippetCard({ snippet, onDelete, onEdit }: SnippetCardProps) {
  const { toast } = useToast();
  const [isExplainDialogOpen, setIsExplainDialogOpen] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(snippet.code)
      .then(() => {
        toast({
          title: "Copied to clipboard!",
          description: `Snippet "${snippet.title}" copied.`,
        });
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Error",
          description: "Failed to copy snippet to clipboard.",
          variant: "destructive",
        });
      });
  };

  const handleExportAsTxt = () => {
    const content = `Title: ${snippet.title}\nDescription: ${snippet.description || 'N/A'}\nTags: ${snippet.tags.join(', ')}\nLanguage: ${snippet.language || 'N/A'}\n\nCode:\n${snippet.code}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${snippet.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Exported!",
      description: `Snippet "${snippet.title}" exported as TXT.`,
    });
  };

  const handleExplainCode = async () => {
    setIsExplaining(true);
    setExplanation(null); // Clear previous explanation
    setIsExplainDialogOpen(true);
    try {
      const result = await explainCode({ code: snippet.code, language: snippet.language });
      setExplanation(result.explanation);
    } catch (error) {
      console.error("Error explaining code:", error);
      setExplanation("Sorry, I couldn't generate an explanation for this snippet right now.");
      toast({
        title: "AI Explanation Error",
        description: "Failed to get an explanation from the AI assistant.",
        variant: "destructive",
      });
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl break-words">{snippet.title}</CardTitle>
          {snippet.description && <CardDescription className="text-sm break-words">{snippet.description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex-grow flex flex-col space-y-3">
          {snippet.language && (
            <div className="text-xs text-muted-foreground">
              Language: <Badge variant="secondary">{snippet.language}</Badge>
            </div>
          )}
          <div className="flex-grow">
            <ScrollArea className="h-48 w-full rounded-md border p-3 bg-muted/30">
              <pre className="text-sm whitespace-pre-wrap break-all">
                <code className={`language-${snippet.language || 'plaintext'}`}>{snippet.code}</code>
              </pre>
            </ScrollArea>
          </div>
          {snippet.tags.length > 0 && (
            <div className="space-x-1 space-y-1">
              {snippet.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleCopyToClipboard} aria-label="Copy code to clipboard">
              <ClipboardCopy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportAsTxt} aria-label="Export snippet as TXT file">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleExplainCode} disabled={isExplaining} aria-label="Explain code with AI">
              {isExplaining && !explanation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
              Explain
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(snippet)} aria-label="Edit snippet">
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Delete snippet" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the snippet
                    "{snippet.title}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(snippet.id)}
                    className={cn(buttonVariants({ variant: "destructive" }))}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isExplainDialogOpen} onOpenChange={setIsExplainDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>AI Explanation for: {snippet.title}</DialogTitle>
            <DialogDescription>
              Here's what the AI assistant thinks about this code snippet:
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-2 -mr-4 py-1">
            {isExplaining && !explanation ? (
              <div className="flex flex-col justify-center items-center py-10 space-y-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating explanation...</p>
              </div>
            ) : explanation ? (
                <ScrollArea className="h-full w-full rounded-md border p-3 bg-muted/20 shadow-inner">
                  <pre className="text-sm whitespace-pre-wrap break-words text-foreground">{explanation}</pre>
                </ScrollArea>
            ) : (
              <p className="text-muted-foreground py-10 text-center">No explanation available or an error occurred.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
