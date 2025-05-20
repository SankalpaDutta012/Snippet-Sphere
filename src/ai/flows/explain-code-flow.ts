
'use server';
/**
 * @fileOverview An AI agent for explaining code snippets.
 *
 * - explainCode - A function that generates an explanation for a given code snippet.
 * - ExplainCodeInput - The input type for the explainCode function.
 * - ExplainCodeOutput - The return type for the explainCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to explain.'),
  language: z.string().optional().describe('The programming language of the snippet (e.g., javascript, python).'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

const ExplainCodeOutputSchema = z.object({
  explanation: z.string().describe('A clear and concise explanation of the code snippet.'),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;

export async function explainCode(input: ExplainCodeInput): Promise<ExplainCodeOutput> {
  return explainCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCodePrompt',
  input: {schema: ExplainCodeInputSchema},
  output: {schema: ExplainCodeOutputSchema},
  prompt: `You are an expert software developer and an excellent communicator. Your task is to explain the provided code snippet.
Focus on:
1. The overall purpose of the code.
2. Key logic or algorithms used.
3. Important functions, classes, or variables and their roles.
4. Any non-obvious behavior or potential points of interest.
Make the explanation clear, concise, and easy for another developer to understand. Assume the reader has some programming knowledge but might not be familiar with this specific snippet or language constructs.

{{#if language}}
Programming Language: {{{language}}}
{{/if}}

Code Snippet:
\`\`\`{{#if language}}{{language}}{{/if}}
{{{code}}}
\`\`\`

Provide only the explanation text.
`,
});

const explainCodeFlow = ai.defineFlow(
  {
    name: 'explainCodeFlow',
    inputSchema: ExplainCodeInputSchema,
    outputSchema: ExplainCodeOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output || { explanation: "Could not generate an explanation at this time." };
  }
);
