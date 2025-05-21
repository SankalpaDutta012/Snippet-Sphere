
'use server';
/**
 * @fileOverview A general purpose AI chatbot flow.
 *
 * - askChatbot - A function that handles a user's question and returns the AI's response.
 * - GeneralChatInputSchema - The input type for the askChatbot function.
 * - GeneralChatOutputSchema - The return type for the askChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GeneralChatInputSchema = z.object({
  question: z.string().describe('The user question to the chatbot.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() })),
  })).optional().describe('The history of the conversation.'),
});
export type GeneralChatInput = z.infer<typeof GeneralChatInputSchema>;

export const GeneralChatOutputSchema = z.object({
  answer: z.string().describe('The chatbot answer to the question.'),
});
export type GeneralChatOutput = z.infer<typeof GeneralChatOutputSchema>;

const generalChatFlow = ai.defineFlow(
  {
    name: 'generalChatFlow',
    inputSchema: GeneralChatInputSchema,
    outputSchema: GeneralChatOutputSchema,
  },
  async (input) => {
    const generateConfig: any = { 
      prompt: input.question,
      output: { schema: GeneralChatOutputSchema },
      system: "You are a helpful AI assistant called Snippet Sphere Helper. You can answer general questions and provide information about software development and code snippets. Keep your answers concise and friendly. If you don't know the answer to something, say so."
    };

    if (input.chatHistory && input.chatHistory.length > 0) {
      generateConfig.history = input.chatHistory;
    }
    
    const {output} = await ai.generate(generateConfig);
    return { answer: output?.answer || "I'm sorry, I couldn't generate a response right now." };
  }
);

export async function askChatbot(input: GeneralChatInput): Promise<GeneralChatOutput> {
  return generalChatFlow(input);
}
