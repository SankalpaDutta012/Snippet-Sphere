'use server';
/**
 * @fileOverview An AI agent for suggesting tags for code snippets.
 *
 * - suggestTags - A function that suggests tags based on code, title, and description.
 * - SuggestTagsInput - The input type for the suggestTags function.
 * - SuggestTagsOutput - The return type for the suggestTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTagsInputSchema = z.object({
  title: z.string().describe('The title of the code snippet.'),
  description: z.string().optional().describe('The description of the code snippet.'),
  code: z.string().describe('The code snippet itself.'),
  existingTags: z.array(z.string()).optional().describe('Any tags already provided by the user.')
});
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;

const SuggestTagsOutputSchema = z.object({
  suggestedTags: z.array(z.string()).describe('An array of 3-5 relevant tags for the snippet. Tags should be lowercase and single words or hyphenated where appropriate (e.g., "react-hook"). Do not suggest tags that are already in existingTags.'),
});
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: {schema: SuggestTagsInputSchema},
  output: {schema: SuggestTagsOutputSchema},
  prompt: `You are an expert in software development and code organization.
Based on the provided code snippet, its title, and description, suggest 3-5 relevant and concise tags.
Tags should be lowercase. If a multi-word concept is highly relevant, use a hyphen (e.g., "react-hook", "api-client").
Avoid overly generic tags unless they are highly specific to the snippet's core functionality.

Consider the programming language, main libraries or frameworks used, the purpose of the snippet, and key concepts.

Title: {{{title}}}
{{#if description}}
Description: {{{description}}}
{{/if}}
Code:
\`\`\`
{{{code}}}
\`\`\`
{{#if existingTags}}
The user has already provided these tags, do not suggest them again: {{#each existingTags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/if}}

Generate an array of 3-5 suggested tags.
`,
});

const suggestTagsFlow = ai.defineFlow(
  {
    name: 'suggestTagsFlow',
    inputSchema: SuggestTagsInputSchema,
    outputSchema: SuggestTagsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output || { suggestedTags: [] }; // Ensure we always return the expected structure
  }
);
