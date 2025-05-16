"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Snippet } from "@/types";

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
import { useEffect } from "react";

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
  const defaultValues = initialData 
    ? {
        title: initialData.title,
        description: initialData.description,
        code: initialData.code,
        tags: initialData.tags.join(", "),
        language: initialData.language,
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
        description: initialData.description,
        code: initialData.code,
        tags: initialData.tags.join(", "),
        language: initialData.language,
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
              <FormLabel>Tags (Optional, comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., react, hook, fetch, api" {...field} />
              </FormControl>
              <FormDescription>Organize your snippets with relevant tags.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-3">
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
