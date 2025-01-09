"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  channelId: string;
}

export function MessageInput({ channelId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onSubmit = async () => {
    if (!content.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/channels/${channelId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() })
      });

      if (!response.ok) throw new Error("Failed to send message");

      setContent("");
      textareaRef.current?.focus();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Type a message..."
        className="resize-none pr-12 py-3 bg-zinc-200/90 dark:bg-zinc-700/75 border-none focus:ring-0"
        disabled={isLoading}
      />
      <div className="absolute right-2 bottom-1">
        <Button
          onClick={onSubmit}
          size="sm"
          variant="ghost"
          className={cn(
            "h-8 w-8 p-0 hover:bg-zinc-600",
            isLoading && "cursor-not-allowed opacity-50"
          )}
          disabled={isLoading || !content.trim()}
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
} 