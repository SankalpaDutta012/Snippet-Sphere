
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, X, Loader2, MessageCircle } from "lucide-react";
import { askChatbot, GeneralChatInput } from "@/ai/flows/general-chat-flow";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
}

export default function ChatbotPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
        // Add initial greeting message from AI
        setMessages([
            { id: "initial-greeting", role: "model", content: "Hello! I'm Snippet Sphere Helper. How can I assist you today?" }
        ]);
    }
  }, [isOpen]);


  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollableViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollableViewport) {
        scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100); // Delay focus slightly for transition
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    const chatHistoryForAI = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    try {
      const aiInput: GeneralChatInput = {
        question: newUserMessage.content,
        chatHistory: chatHistoryForAI,
      };
      const result = await askChatbot(aiInput);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: result.answer,
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Chatbot error:", error);
      toast({
        title: "Chatbot Error",
        description: "Sorry, something went wrong. Please try again.",
        variant: "destructive",
      });
       const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: "I encountered an error. Please try asking again later.",
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <>
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        onClick={() => setIsOpen(true)}
        aria-label="Open Chatbot"
      >
        <Bot className="h-7 w-7" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0 gap-0 rounded-lg">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center">
              <MessageCircle className="mr-2 h-6 w-6 text-primary" />
              Chat Assistant
            </DialogTitle>
            <DialogDescription className="text-xs">
              Ask me anything about coding or Snippet Sphere!
            </DialogDescription>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          <ScrollArea className="flex-grow overflow-y-auto h-0 min-h-[200px]" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-start gap-2.5 text-sm",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "model" && (
                    <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center shadow">
                       <Bot className="h-5 w-5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "p-3 rounded-lg shadow max-w-[80%]",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-card border rounded-bl-none"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                   {msg.role === "user" && (
                     <div className="flex-shrink-0 bg-muted text-muted-foreground rounded-full h-8 w-8 flex items-center justify-center shadow">
                       <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2.5 justify-start">
                  <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center shadow">
                     <Bot className="h-5 w-5" />
                  </div>
                  <div className="p-3 rounded-lg shadow bg-card border rounded-bl-none">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex w-full items-center space-x-2"
            >
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 h-10 rounded-md focus-visible:ring-accent"
                disabled={isLoading}
                autoComplete="off"
              />
              <Button type="submit" size="icon" disabled={isLoading || inputValue.trim() === ""} className="h-10 w-10 rounded-md">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
