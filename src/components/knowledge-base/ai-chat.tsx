"use client";

import { useState } from "react";
import { Send, Loader2, FileText, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Citation {
  content: string;
  documentId?: string;
  documentName?: string;
  documentUrl?: string;
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  citations?: Citation[];
}

interface AIResponse {
  content: string;
  messageId: string;
  sourceMessages?: Array<{
    content: string;
    documentId?: string;
    documentName?: string;
    documentUrl?: string;
  }>;
}

interface AIChatProps {
  workspaceId: string;
}

export function AIChat({ workspaceId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          workspaceId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data: AIResponse = await response.json();

      const aiMessage: Message = {
        id: data.messageId,
        content: data.content,
        role: "assistant",
        citations: data.sourceMessages?.filter(msg => msg.documentId && msg.documentName).map(msg => ({
          content: msg.content,
          documentId: msg.documentId,
          documentName: msg.documentName,
          documentUrl: msg.documentUrl
        })) || []
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col space-y-2",
                message.role === "assistant" ? "items-start" : "items-end"
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-3 py-2 max-w-[80%] break-words",
                  message.role === "assistant" 
                    ? "bg-muted" 
                    : "bg-primary text-primary-foreground"
                )}
              >
                {message.content}
              </div>
              {message.citations && message.citations.length > 0 && (
                <div className="w-full space-y-2 mt-2">
                  <p className="text-sm font-medium text-muted-foreground">Sources:</p>
                  {message.citations.map((citation, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm bg-muted/50 rounded-md p-2">
                      <FileText className="h-4 w-4 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{citation.documentName}</p>
                          {citation.documentUrl && (
                            <a 
                              href={citation.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <p className="italic text-muted-foreground">{citation.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask about your documents..."
            className="flex-1 resize-none bg-background px-3 py-2 border rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[80px]"
          />
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
} 