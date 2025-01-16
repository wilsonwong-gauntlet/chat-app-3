"use client";

import React from "react";
import { useState } from "react";
import { Send, Loader2, FileText, ExternalLink, Bot, Sparkles, ChevronDown, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

const EXAMPLE_QUERIES = [
  "What are the key points from all documents?",
  "Compare and contrast the main ideas",
  "Find patterns across documents",
  "Summarize the latest updates",
];

function formatMessageContent(content: string, truncate = false) {
  // Split the content into lines
  const lines = content.split('\n');
  const formattedLines: JSX.Element[] = [];
  let inList = false;
  let listItems: string[] = [];

  // Function to format text with markdown-style syntax
  const formatText = (text: string) => {
    // Handle bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Handle headers
    text = text.replace(/^###\s+(.*)$/g, '<h3>$1</h3>');
    text = text.replace(/^##\s+(.*)$/g, '<h2>$1</h2>');
    text = text.replace(/^#\s+(.*)$/g, '<h1>$1</h1>');
    
    return text;
  };

  lines.forEach((line, index) => {
    if (truncate && formattedLines.length >= 3) return; // Limit to 3 blocks when truncating

    // Check for list items (lines starting with "- ", "• ", "* ", or "1. ", "2. " etc)
    const listItemMatch = line.match(/^[-•*]\s+(.+)/) || line.match(/^\d+\.\s+(.+)/);
    
    if (listItemMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(formatText(listItemMatch[1]));
    } else {
      // If we were in a list and now we're not, add the list
      if (inList) {
        formattedLines.push(
          <ul key={`list-${index}`} className="list-disc pl-6 my-2 space-y-1">
            {listItems.slice(0, truncate ? 3 : undefined).map((item, i) => (
              <li key={i} className="text-sm" dangerouslySetInnerHTML={{ __html: item }} />
            ))}
            {truncate && listItems.length > 3 && (
              <li key="more" className="text-sm text-muted-foreground">
                ... and {listItems.length - 3} more items
              </li>
            )}
          </ul>
        );
        inList = false;
        listItems = [];
      }
      
      // Add non-list content
      if (line.trim()) {
        const formattedLine = formatText(line);
        formattedLines.push(
          <div 
            key={index} 
            className={cn(
              "mb-2",
              formattedLine.includes('<h1>') && "text-lg font-bold",
              formattedLine.includes('<h2>') && "text-base font-semibold",
              formattedLine.includes('<h3>') && "text-sm font-medium"
            )}
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      }
    }
  });

  // If we're still in a list at the end, add it
  if (inList && listItems.length > 0) {
    formattedLines.push(
      <ul key="list-final" className="list-disc pl-6 my-2 space-y-1">
        {listItems.slice(0, truncate ? 3 : undefined).map((item, i) => (
          <li key={i} className="text-sm" dangerouslySetInnerHTML={{ __html: item }} />
        ))}
        {truncate && listItems.length > 3 && (
          <li key="more" className="text-sm text-muted-foreground">
            ... and {listItems.length - 3} more items
          </li>
        )}
      </ul>
    );
  }

  if (truncate && formattedLines.length > 3) {
    return (
      <div className="space-y-2">
        {formattedLines.slice(0, 3)}
        <p className="text-xs text-muted-foreground">... content truncated</p>
      </div>
    );
  }

  return <div className="space-y-2">{formattedLines}</div>;
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
    <div className="flex flex-col h-full">
      {messages.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Knowledge Assistant</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Ask questions about your documents and I'll analyze them for insights.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {EXAMPLE_QUERIES.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => {
                  setInput(query);
                  handleSubmit();
                }}
              >
                <Sparkles className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                <span className="text-sm text-left">{query}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "assistant" ? "items-start" : "items-start justify-end"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "flex flex-col space-y-2 max-w-[80%]",
                  message.role === "user" && "items-end"
                )}
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {message.role === "assistant" ? "AI Assistant" : "You"}
                  </span>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <User2 className="h-4 w-4 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm",
                    message.role === "assistant"
                      ? "bg-background border"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {message.role === "assistant" 
                    ? formatMessageContent(message.content)
                    : message.content
                  }
                </div>

                {message.citations && message.citations.length > 0 && (
                  <Collapsible className="w-full">
                    <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                      <ChevronDown className="h-3 w-3" />
                      {message.citations.length} source{message.citations.length !== 1 ? 's' : ''}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      {message.citations.map((citation, index) => (
                        <div key={index} className="group flex flex-col space-y-1 rounded-md border bg-muted/30 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-medium">{citation.documentName}</span>
                            </div>
                            {citation.documentUrl && (
                              <a
                                href={citation.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                              >
                                View Document
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          {citation.content && (
                            <div className="text-xs text-muted-foreground [&_ul]:text-xs [&_p]:text-xs [&_p]:mb-1 [&_ul]:pl-4 [&_ul]:my-1 [&_ul]:space-y-0.5 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm">
                              {formatMessageContent(citation.content, true)}
                            </div>
                          )}
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
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
            placeholder="Ask about patterns, insights, or specific information..."
            className="flex-1 resize-none bg-background px-3 py-2 border rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[80px]"
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-auto"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 