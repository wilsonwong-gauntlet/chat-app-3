"use client";

import { useEffect, useState, useRef } from "react";
import { Message, User, Channel } from "@prisma/client";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

import { pusherClient } from "@/lib/pusher";
import { MessageItem } from "./message-item";
import { ThreadView } from "./thread-view";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageWithUser } from "@/types";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 25;

interface MessageListProps {
  channelId: string;
  initialMessages: MessageWithUser[];
}

export function MessageList({
  channelId,
  initialMessages
}: MessageListProps) {
  const [messages, setMessages] = useState<MessageWithUser[]>(() => {
    // Initialize with deduped messages
    const uniqueMessages = new Map(
      initialMessages
        .filter(message => !message.parentId)
        .map(message => [message.id, message])
    );
    return Array.from(uniqueMessages.values());
  });
  const [activeThread, setActiveThread] = useState<MessageWithUser | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const processedEvents = useRef(new Set<string>());

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0
  });

  const scrollToBottom = () => {
    bottomRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 200;
    setShowScrollBottom(!isNearBottom);
  };

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const response = await fetch(`/api/channels/${channelId}/messages?cursor=${messages[0]?.id}&take=${PAGE_SIZE}`);
      const data = await response.json();

      if (!data.length) {
        setHasMore(false);
        return;
      }

      setMessages(prev => {
        const newMessages = data.filter((msg: MessageWithUser) => !msg.parentId);
        const uniqueMessages = new Map([
          ...newMessages.map((msg: MessageWithUser) => [msg.id, msg]),
          ...prev.map((msg: MessageWithUser) => [msg.id, msg])
        ]);
        const messagesArray = Array.from(uniqueMessages.values()) as MessageWithUser[];
        return messagesArray.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (inView && hasMore) {
      loadMoreMessages();
    }
  }, [inView]);

  useEffect(() => {
    pusherClient.subscribe(channelId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: MessageWithUser) => {
      const eventKey = `${channelId}:${message.id}:new`;
      if (processedEvents.current.has(eventKey)) return;
      processedEvents.current.add(eventKey);

      if (!message.parentId) {
        setMessages((current) => {
          const exists = current.some(msg => msg.id === message.id);
          if (exists) return current;
          
          const newMessages = [...current, message];
          return newMessages.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        bottomRef?.current?.scrollIntoView();
      }
    };

    const updateHandler = (updatedMessage: MessageWithUser) => {
      const eventKey = `${channelId}:${updatedMessage.id}:update`;
      if (processedEvents.current.has(eventKey)) return;
      processedEvents.current.add(eventKey);

      if (!updatedMessage.parentId) {
        setMessages((current) => 
          current.map((msg) => 
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      }
    };

    const deleteHandler = (messageId: string) => {
      const eventKey = `${channelId}:${messageId}:delete`;
      if (processedEvents.current.has(eventKey)) return;
      processedEvents.current.add(eventKey);

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
      processedEvents.current.clear();
    };
  }, [channelId]);

  return (
    <div className="flex h-full relative">
      <div className={`flex-1 ${activeThread ? 'border-r border-zinc-200 dark:border-zinc-700' : ''}`}>
        <div 
          className="h-full overflow-y-auto px-4"
          onScroll={handleScroll}
        >
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="flex items-center justify-center p-4"
            >
              {isLoadingMore ? (
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
              ) : null}
            </div>
          )}
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageItem
                key={`${channelId}:${message.id}`}
                message={message}
                onThreadClick={setActiveThread}
              />
            ))}
          </div>
          <div ref={bottomRef} />
        </div>
        {showScrollBottom && (
          <Button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 rounded-full shadow-lg"
            size="sm"
          >
            Scroll to bottom
          </Button>
        )}
      </div>
      {activeThread && (
        <div className="w-[400px] border-l border-zinc-200 dark:border-zinc-700 hidden md:block bg-zinc-50/50">
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