export interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  tags: string[];
  createdAt: Date;
  language?: string; // Optional: for syntax highlighting or filtering in future
}
