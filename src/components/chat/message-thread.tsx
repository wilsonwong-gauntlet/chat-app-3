"use client";

import { useEffect, useState } from "react";
import { Message, User } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { MessageCircle, X } from "lucide-react";

import { pusherClient } from "@/lib/pusher";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageInput } from "./message-input";
import { MessageItem } from "./message-item";

interface MessageWithUser extends Message {
  user: User;
  replies?: MessageWithUser[];
}

interface MessageThreadProps {
  channelId: string;
  parentMessage: MessageWithUser;
  onClose: () => void;
}

export function MessageThread({
  channelId,
  parentMessage,
  onClose
}: MessageThreadProps) {
  const { user } = useUser();
  const [replies, setReplies] = useState<MessageWithUser[]>(parentMessage.replies || []);

  useEffect(() => {
    // Subscribe to thread-specific events
    const threadChannel = `${channelId}:thread:${parentMessage.id}`;
    pusherClient.subscribe(threadChannel);

    const messageHandler = (message: MessageWithUser) => {
      setReplies((current) => [...current, message]);
    };

    const updateHandler = (updatedMessage: MessageWithUser) => {
      setReplies((current) => 
        current.map((msg) => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      );
    };

    const deleteHandler = (messageId: string) => {
      setReplies((current) => 
        current.filter((msg) => msg.id !== messageId)
      );
    };

    pusherClient.bind("new-message", messageHandler);
    pusherClient.bind("message-update", updateHandler);
    pusherClient.bind("message-delete", deleteHandler);

    return () => {
      pusherClient.unsubscribe(threadChannel);
      pusherClient.unbind("new-message", messageHandler);
      pusherClient.unbind("message-update", updateHandler);
      pusherClient.unbind("message-delete", deleteHandler);
    };
  }, [channelId, parentMessage.id]);

  return (
    <div className="flex flex-col h-full border-l dark:border-zinc-700">
      <div className="p-4 border-b dark:border-zinc-700 flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">Thread</span>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="pb-4 mb-4 border-b dark:border-zinc-700">
          <MessageItem
            message={parentMessage}
            isThread
          />
        </div>
        <div className="space-y-4">
          {replies.map((reply) => (
            <MessageItem
              key={reply.id}
              message={reply}
              isThread
            />
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t dark:border-zinc-700">
        <MessageInput
          channelId={channelId}
          parentId={parentMessage.id}
        />
      </div>
    </div>
  );
} 