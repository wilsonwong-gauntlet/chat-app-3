"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  apiUrl: string;
  query: Record<string, any>;
  name: string;
  type: "conversation" | "channel";
}

export const MessageInput = ({
  apiUrl,
  query,
  name,
  type
}: MessageInputProps) => {
  const [content, setContent] = useState("");
  const params = useParams();

  const onSubmit = async () => {
    if (!content.trim()) return;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content,
          ...query,
        })
      });

      if (response.ok) {
        setContent("");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="p-4 bg-white dark:bg-[#1E1F22]">
      <div className="relative">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={`Message ${type === "conversation" ? name : "#" + name}`}
          className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
        />
        <div className="absolute top-[50%] right-4 -translate-y-[50%]">
          <Button
            type="submit"
            disabled={!content.trim()}
            onClick={onSubmit}
            size="sm"
            variant="default"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
} 