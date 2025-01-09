"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  channelId: string;
  parentId?: string;
}

export function MessageInput({
  channelId,
  parentId
}: MessageInputProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onSubmit = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content,
          parentId
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setContent("");
      router.refresh();
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
      if (content.trim()) {
        onSubmit();
      }
    }
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="flex items-center gap-x-2">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={parentId ? "Reply to thread..." : "Send a message..."}
        className="resize-none"
        rows={1}
        disabled={isLoading}
      />
      <Button
        onClick={onSubmit}
        disabled={!content.trim() || isLoading}
        size="icon"
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
} 