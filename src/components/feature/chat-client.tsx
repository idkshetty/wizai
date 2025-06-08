
"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, SendHorizonal, User, Sparkles, MessageSquare, Trash2 } from "lucide-react";
import { startConversation, type StartConversationInput, type StartConversationOutput } from "@/ai/flows/start-conversation";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const LOCAL_STORAGE_KEY = "chatMessages";

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on initial render
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages)) {
          setMessages(parsedMessages);
        }
      }
    } catch (error) {
      console.error("Failed to load messages from localStorage", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save messages to localStorage", error);
    }
  }, [messages]);

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const aiInput: StartConversationInput = { query: input };
      const result: StartConversationOutput = await startConversation(aiInput);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive",
      });
       const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]); // This will trigger the save useEffect, saving an empty array
    toast({
      title: "Chat Cleared",
      description: "Your conversation history has been cleared.",
    });
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <Card className="w-full max-w-3xl mx-auto h-full flex flex-col shadow-xl rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-2xl flex items-center">
          <MessageSquare className="mr-2 h-6 w-6 text-primary" />
          Talk with Wiz!
        </CardTitle>
        {messages.length > 0 && (
          <Button variant="ghost" size="icon" onClick={handleClearChat} aria-label="Clear chat history">
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-10">
                <MessageSquare className="w-16 h-16 mb-4" />
                <p className="text-lg font-semibold text-foreground">Start a conversation with Wiz!</p>
                <p className="text-sm">Ask Wiz anything, or type your query below.</p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "justify-end" : ""
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-xl px-4 py-3 shadow-md ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                     <AvatarFallback className="bg-secondary text-secondary-foreground">
                       <User className="h-5 w-5" />
                     </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && messages.length > 0 && ( // Only show loading dots if there are messages
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                   <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="h-5 w-5" />
                    </AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] rounded-xl px-4 py-3 shadow-md bg-card border">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
             {isLoading && messages.length === 0 && ( // Centered loader for initial loading
                <div className="flex justify-center items-center h-full pt-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
             )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Wiz anything..."
            className="flex-grow resize-none rounded-lg border p-3 focus-visible:ring-primary"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoading}
            aria-label="Chat input"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-lg" aria-label="Send message">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendHorizonal className="h-5 w-5" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
