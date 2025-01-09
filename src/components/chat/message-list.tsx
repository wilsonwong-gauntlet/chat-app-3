"use client";

import { useEffect, useState, useRef } from "react";
import { Message, User } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { Edit2, Trash2, X, Check } from "lucide-react";

import { pusherClient } from "@/lib/pusher";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
  const { user } = useUser();
  const [messages, setMessages] = useState<MessageWithUser[]>(initialMessages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pusherClient.subscribe(channelId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: MessageWithUser) => {
      setMessages((current) => [...current, message]);
      bottomRef?.current?.scrollIntoView();
    };

    const updateHandler = (updatedMessage: MessageWithUser) => {
      setMessages((current) => 
        current.map((msg) => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      );
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

  const onEdit = async (messageId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/channels/${channelId}/messages/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: editContent })
      });

      if (!response.ok) {
        throw new Error("Failed to edit message");
      }

      setEditingId(null);
      setEditContent("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async (messageId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/channels/${channelId}/messages/${messageId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {messages.map((message) => {
        const isOwner = message.user.clerkId === user?.id;
        const isEditing = editingId === message.id;

        return (
          <div key={message.id} className="group flex items-start gap-x-3">
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-x-2">
                <p className="font-semibold text-sm">
                  {message.user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleString()}
                </p>
                {message.updatedAt !== message.createdAt && (
                  <p className="text-xs text-muted-foreground italic">
                    (edited)
                  </p>
                )}
              </div>
              {isEditing ? (
                <div className="flex items-center gap-x-2 mt-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 resize-none"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => onEdit(message.id)}
                    size="icon"
                    variant="ghost"
                    disabled={isLoading || !editContent.trim()}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingId(null);
                      setEditContent("");
                    }}
                    size="icon"
                    variant="ghost"
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm">
                  {message.content}
                </p>
              )}
            </div>
            {isOwner && !isEditing && (
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-2">
                <Button
                  onClick={() => {
                    setEditingId(message.id);
                    setEditContent(message.content);
                  }}
                  size="icon"
                  variant="ghost"
                  disabled={isLoading}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => onDelete(message.id)}
                  size="icon"
                  variant="ghost"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
} 