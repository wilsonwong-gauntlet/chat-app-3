"use client";

import { useEffect, useState, useRef } from "react";
import { Message, User, Channel } from "@prisma/client";

import { pusherClient } from "@/lib/pusher";
import { MessageItem } from "./message-item";
import { ThreadView } from "./thread-view";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageWithUser } from "@/types";

interface MessageListProps {
  channelId: string;
  initialMessages: MessageWithUser[];
}

export function MessageList({
  channelId,
  initialMessages
}: MessageListProps) {
  const [messages, setMessages] = useState<MessageWithUser[]>(
    initialMessages.filter(message => !message.parentId)
  );
  const [activeThread, setActiveThread] = useState<MessageWithUser | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pusherClient.subscribe(channelId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: MessageWithUser) => {
      if (!message.parentId) {
        setMessages((current) => {
          const exists = current.some(msg => msg.id === message.id);
          if (exists) return current;
          return [...current, message];
        });
        bottomRef?.current?.scrollIntoView();
      }
    };

    const updateHandler = (updatedMessage: MessageWithUser) => {
      if (!updatedMessage.parentId) {
        setMessages((current) => 
          current.map((msg) => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      }
    };

    const deleteHandler = (messageId: string) => {
      setMessages((current) => 
        current.filter((msg) => msg.id !== messageId)
      );
    };

    pusherClient.bind("new-message", messageHandler);
    pusherClient.bind("message-update", updateHandler);
    pusherClient.bind("message-delete", deleteHandler);

    return () => {
      pusherClient.unsubscribe(channelId);
      pusherClient.unbind("new-message", messageHandler);
      pusherClient.unbind("message-update", updateHandler);
      pusherClient.unbind("message-delete", deleteHandler);
    };
  }, [channelId]);

  return (
    <div className="flex h-full">
      <div className={`flex-1 ${activeThread ? 'border-r' : ''}`}>
        <ScrollArea className="h-full">
          <div className="flex-1 p-4 space-y-4">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onThreadClick={setActiveThread}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>
      {activeThread && (
        <div className="w-[400px] border-l dark:border-zinc-700 hidden md:block">
          <ThreadView
            thread={activeThread}
            channelId={channelId}
            onClose={() => setActiveThread(null)}
          />
        </div>
      )}
    </div>
  );
} 