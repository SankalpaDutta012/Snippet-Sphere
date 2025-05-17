"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Snippet } from "@/types";
import { suggestTags, SuggestTagsInput } from "@/ai/flows/suggest-tags-flow";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
  code: z.string().min(1, "Code snippet cannot be empty"),
  tags: z.string().optional(),
  language: z.string().optional(),
});

type SnippetFormValues = z.infer<typeof formSchema>;

interface SnippetFormProps {
  onSubmit: (data: SnippetFormValues) => void;
  onCancel: () => void;
  initialData?: Snippet | null;
}

export default function SnippetForm({ onSubmit, onCancel, initialData }: SnippetFormProps) {
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const { toast } = useToast();

  const defaultValues = initialData 
    ? {
        title: initialData.title,
        description: initialData.description || "",
        code: initialData.code,
        tags: initialData.tags.join(", "),
        language: initialData.language || "",
      }
    : {
        title: "",
        description: "",
        code: "",
        tags: "",
        language: "javascript",
      };

  const form = useForm<SnippetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description || "",
        code: initialData.code,
        tags: initialData.tags.join(", "),
        language: initialData.language || "",
      });
    } else {
      form.reset(defaultValues);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, form.reset]);


  const handleSubmit = (values: SnippetFormValues) => {
    onSubmit(values);
    form.reset();
  };

  const handleSuggestTags = async () => {
    setIsSuggestingTags(true);
    const { title, description, code } = form.getValues();
    const currentTagsString = form.getValues("tags") || "";
    const existingTagsArray = currentTagsString.split(",").map(t => t.trim()).filter(t => t);

    if (!code.trim()) {
      toast({
        title: "Cannot suggest tags",
        description: "Please provide some code before suggesting tags.",
        variant: "destructive",
      });
      setIsSuggestingTags(false);
      return;
    }

    try {
      const aiInput: SuggestTagsInput = { title, code };
      if (description) aiInput.description = description;
      if (existingTagsArray.length > 0) aiInput.existingTags = existingTagsArray;
      
      const result = await suggestTags(aiInput);
      
      if (result.suggestedTags && result.suggestedTags.length > 0) {
        const newTags = result.suggestedTags;
        const combinedTagsSet = new Set([...existingTagsArray, ...newTags]);
        form.setValue("tags", Array.from(combinedTagsSet).join(", "));
        toast({
          title: "Tags Suggested!",
          description: "AI has added new tag suggestions.",
        });
      } else {
        toast({
          title: "No new tags suggested",
          description: "AI couldn't find any new tags to suggest, or there was an issue.",
        });
      }
    } catch (error) {
      console.error("Error suggesting tags:", error);
      toast({
        title: "Error Suggesting Tags",
        description: "An error occurred while trying to suggest tags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSuggestingTags(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., React Fetch Hook" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="A custom hook for fetching data in React components." {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Textarea placeholder="Paste your code snippet here..." {...field} rows={10} className="font-mono text-sm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., javascript, python, html" {...field} />
              </FormControl>
              <FormDescription>Helps with syntax highlighting if supported.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Tags (Optional, comma-separated)</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSuggestTags}
                  disabled={isSuggestingTags}
                  className="text-xs"
                >
                  {isSuggestingTags ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 h-3 w-3 text-accent" />
                  )}
                  Suggest Tags
                </Button>
              </div>
              <FormControl>
                <Input placeholder="e.g., react, hook, fetch, api" {...field} />
              </FormControl>
              <FormDescription>Organize your snippets with relevant tags. Click the button above to get AI suggestions.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="default">
            {initialData ? "Update Snippet" : "Save Snippet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
