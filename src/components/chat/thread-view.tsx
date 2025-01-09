"use client";

import { useEffect, useState, useRef } from "react";
import { Message, User, Channel } from "@prisma/client";
import { X, MessageCircle } from "lucide-react";

import { pusherClient } from "@/lib/pusher";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageInput } from "./message-input";
import { MessageItem } from "./message-item";
import { MessageWithUser } from "@/types";

interface ThreadViewProps {
  thread: MessageWithUser;
  channelId: string;
  onClose: () => void;
}

export function ThreadView({
  thread,
  channelId,
  onClose
}: ThreadViewProps) {
  const [replies, setReplies] = useState<MessageWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch thread replies when opened
  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const response = await fetch(`/api/channels/${channelId}/messages/${thread.id}/replies`);
        if (response.ok) {
          const data = await response.json();
          setReplies(data);
        }
      } catch (error) {
        console.error("Failed to fetch replies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReplies();
  }, [channelId, thread.id]);

  useEffect(() => {
    const threadChannel = `thread-${channelId}-${thread.id}`;
    pusherClient.subscribe(threadChannel);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: MessageWithUser) => {
      // Only handle messages that belong to this thread
      if (message.parentId === thread.id) {
        setReplies((current) => {
          // Check if message already exists
          const exists = current.some(msg => msg.id === message.id);
          if (exists) return current;
          
          return [...current, message];
        });
        bottomRef?.current?.scrollIntoView();
      }
    };

    const updateHandler = (updatedMessage: MessageWithUser) => {
      // Only handle updates for messages in this thread
      if (updatedMessage.parentId === thread.id) {
        setReplies((current) => 
          current.map((msg) => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      }
    };

    const deleteHandler = (messageId: string) => {
      setReplies((current) => 
        current.filter((msg) => msg.id !== messageId)
      );
    };

    // Subscribe to both thread-specific and main channel events
    pusherClient.subscribe(channelId);
    
    pusherClient.bind("new-message", messageHandler);
    pusherClient.bind("message-update", updateHandler);
    pusherClient.bind("message-delete", deleteHandler);

    return () => {
      pusherClient.unsubscribe(threadChannel);
      pusherClient.unsubscribe(channelId);
      pusherClient.unbind("new-message", messageHandler);
      pusherClient.unbind("message-update", updateHandler);
      pusherClient.unbind("message-delete", deleteHandler);
    };
  }, [channelId, thread.id]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 h-14 flex items-center justify-between border-b">
        <div className="flex items-center gap-x-2">
          <MessageCircle className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Thread</span>
            <span className="text-xs text-muted-foreground">
              #{thread.channel?.name || 'channel'}
            </span>
          </div>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="pb-4 border-b">
            <MessageItem
              message={thread}
              isThread
            />
            <div className="mt-1 ml-12 text-xs text-muted-foreground">
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </div>
          </div>
          <div className="space-y-4">
            {replies.map((reply) => (
              <MessageItem
                key={`${reply.id}-${reply.updatedAt}`}
                message={reply}
                isThread
              />
            ))}
          </div>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <MessageInput
          channelId={channelId}
          parentId={thread.id}
        />
      </div>
    </div>
  );
} 