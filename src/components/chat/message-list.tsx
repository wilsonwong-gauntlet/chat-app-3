"use client";

import { useEffect, useState, useRef } from "react";
import { Message, User } from "@prisma/client";
import { pusherClient } from "@/lib/pusher";

interface MessageWithUser extends Message {
  user: User;
}

interface MessageListProps {
  channelId: string;
  initialMessages: MessageWithUser[];
}

export function MessageList({
  channelId,
  initialMessages
}: MessageListProps) {
  const [messages, setMessages] = useState<MessageWithUser[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pusherClient.subscribe(channelId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: MessageWithUser) => {
      setMessages((current) => [...current, message]);
      bottomRef?.current?.scrollIntoView();
    };

    pusherClient.bind("new-message", messageHandler);

    return () => {
      pusherClient.unsubscribe(channelId);
      pusherClient.unbind("new-message", messageHandler);
    };
  }, [channelId]);

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {messages.map((message) => (
        <div key={message.id} className="flex items-start gap-x-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-x-2">
              <p className="font-semibold text-sm">
                {message.user.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(message.createdAt).toLocaleString()}
              </p>
            </div>
            <p className="text-sm">
              {message.content}
            </p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
} 