"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  channelId: string;
  initialReactions?: Reaction[];
}

export function MessageReactions({
  messageId,
  channelId,
  initialReactions = []
}: MessageReactionsProps) {
  const router = useRouter();
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to reaction updates
    const channel = pusherClient.subscribe(channelId);

    // Handle reaction updates
    const handleReactionUpdate = (data: {
      messageId: string;
      reactions: Reaction[];
    }) => {
      if (data.messageId === messageId) {
        setReactions(data.reactions);
      }
    };

    channel.bind("reaction:update", handleReactionUpdate);

    return () => {
      channel.unbind("reaction:update", handleReactionUpdate);
      pusherClient.unsubscribe(channelId);
    };
  }, [channelId, messageId]);

  const fetchReactions = async () => {
    try {
      const response = await fetch(
        `/api/channels/${channelId}/messages/${messageId}/reactions`
      );
      if (!response.ok) throw new Error("Failed to fetch reactions");
      const data = await response.json();
      setReactions(data.reactions);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  useEffect(() => {
    fetchReactions();
  }, [channelId, messageId]);

  const handleReaction = async (emoji: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/channels/${channelId}/messages/${messageId}/reactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emoji }),
        }
      );

      if (!response.ok) throw new Error("Failed to add reaction");
      
      const data = await response.json();
      setReactions(data.reactions);
    } catch (error) {
      console.error("Error adding reaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (reactions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {reactions.map((reaction) => (
        <Button
          key={`${messageId}-${reaction.emoji}`}
          variant="ghost"
          size="sm"
          onClick={() => handleReaction(reaction.emoji)}
          disabled={isLoading}
          className={cn(
            "h-5 rounded-full px-1.5 text-xs hover:bg-accent/50",
            reaction.hasReacted && "bg-accent/50"
          )}
        >
          <span className="mr-0.5">{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </Button>
      ))}
    </div>
  );
} 