"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { MessageWithUser } from "@/types";
import { SmilePlus, Reply, Edit2, Trash2, Check, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@clerk/nextjs";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { MessageReactions } from "@/components/message-reactions";
import { getFileType } from "@/lib/s3";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { pusherClient } from "@/lib/pusher";

interface MessageItemProps {
  message: MessageWithUser;
  onThreadClick?: (message: MessageWithUser) => void;
  isThread?: boolean;
}

export function MessageItem({
  message: initialMessage,
  isThread = false,
  onThreadClick
}: MessageItemProps) {
  const [message, setMessage] = useState(initialMessage);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { resolvedTheme } = useTheme();
  const { user } = useUser();

  useEffect(() => {
    const channel = message.channelId;
    
    const updateHandler = (updatedMessage: MessageWithUser) => {
      if (updatedMessage.id === message.id) {
        setMessage(updatedMessage);
      }
    };

    pusherClient.subscribe(channel);
    pusherClient.bind("message-update", updateHandler);

    return () => {
      pusherClient.unsubscribe(channel);
      pusherClient.unbind("message-update", updateHandler);
    };
  }, [message.channelId, message.id]);

  const formatTimestamp = (date: Date) => {
    return format(new Date(date), "p");
  };

  const onEdit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/channels/${message.channelId}/messages/${message.id}`, {
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

  const onDelete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/channels/${message.channelId}/messages/${message.id}`, {
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

  const onEmojiSelect = async (emoji: any) => {
    try {
      const response = await fetch(`/api/channels/${message.channelId}/messages/${message.id}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ emoji: emoji.native })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add reaction");
      }

      setIsPickerOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isOwner = message.user.clerkId === user?.id;
  const isEditing = editingId === message.id;
  const replyCount = message._count?.replies ?? 0;

  return (
    <div className="relative group flex items-start gap-x-3 py-2 px-4">
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.user.imageUrl || ""} />
          <AvatarFallback>
            {message.user.name?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {message.user.name}
            </p>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatTimestamp(message.createdAt)}
            </span>
            {message.isAIResponse && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                AI
              </span>
            )}
          </div>
          {message.updatedAt > message.createdAt && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
              (edited)
            </span>
          )}
        </div>
        <div className="space-y-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 resize-none p-2 h-[70px] min-w-0 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                disabled={isLoading}
                placeholder="Edit your message..."
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={onEdit}
                  size="sm"
                  variant="ghost"
                  disabled={isLoading || !editContent.trim()}
                  className="h-7 w-7 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    setEditingId(null);
                    setEditContent("");
                  }}
                  size="sm"
                  variant="ghost"
                  disabled={isLoading}
                  className="h-7 w-7 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                <div 
                  dangerouslySetInnerHTML={{ __html: message.content }}
                  className="prose prose-sm dark:prose-invert prose-zinc max-w-none break-words [&_p]:leading-normal [&_p]:my-0 [&_pre]:my-0 [&_code]:px-1 [&_code]:py-0.5 [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-800 [&_code]:rounded-md [&_code]:text-sm [&_code]:font-mono"
                />
              </div>
              {message.fileUrl && (
                <>
                  {getFileType(message.fileUrl) === "image" ? (
                    <div className="relative mt-2 aspect-video w-48 overflow-hidden rounded-md">
                      <Image
                        src={message.fileUrl}
                        alt="Uploaded image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <a 
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Attachment
                    </a>
                  )}
                </>
              )}
              <MessageReactions
                messageId={message.id}
                channelId={message.channelId}
              />
            </>
          )}
        </div>
        {!isThread && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              onClick={() => onThreadClick?.(message)}
              size="sm"
              variant="ghost"
              className="text-xs text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 flex items-center gap-1"
            >
              <MessageCircle className="h-3 w-3" />
              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </Button>
          </div>
        )}
      </div>
      <div 
        className={cn(
          "flex items-center gap-1 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-700 rounded-md py-1 px-1 transition-all",
          "opacity-0 group-hover:opacity-100 md:opacity-30 focus-within:opacity-100",
          "absolute right-4 top-2"
        )}
        role="toolbar"
        aria-label="Message actions"
      >
        <TooltipProvider>
          <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                    aria-label="Add reaction"
                  >
                    <SmilePlus className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                Add reaction
              </TooltipContent>
            </Tooltip>
            <PopoverContent 
              className="w-full p-0 border-none shadow-lg" 
              side="top" 
              align="end"
            >
              <Picker
                data={data}
                onEmojiSelect={onEmojiSelect}
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                previewPosition="none"
                skinTonePosition="none"
              />
            </PopoverContent>
          </Popover>
          {!isThread && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onThreadClick?.(message)}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                  aria-label="Reply in thread"
                >
                  <Reply className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                Reply in thread
              </TooltipContent>
            </Tooltip>
          )}
          {isOwner && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingId(message.id);
                      setEditContent(message.content);
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                    aria-label="Edit message"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  Edit message
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onDelete}
                    disabled={isLoading}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                    aria-label="Delete message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  Delete message
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
} 