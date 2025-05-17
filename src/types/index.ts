
export interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  tags: string[];
  createdAt: Date;
  language?: string; // Optional: for syntax highlighting or filtering in future
}

// Added User type for authentication
export interface User {
  id: string;
  username: string;
  // Add other user-specific fields if needed, e.g., email
}
