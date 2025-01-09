"use client";

import { useState, useEffect } from "react";
import { Message, User, Channel } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { Edit2, MessageCircle, Trash2, X, Check, SmilePlus, Reply } from "lucide-react";
import { format } from "date-fns";
import { pusherClient } from "@/lib/pusher";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MessageWithUser } from "@/types";
import { Markdown } from "@/components/markdown";
import { MessageReactions } from "@/components/message-reactions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageItemProps {
  message: MessageWithUser;
  isThread?: boolean;
  onThreadClick?: (message: MessageWithUser) => void;
}

export function MessageItem({
  message,
  isThread,
  onThreadClick
}: MessageItemProps) {
  const { user } = useUser();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [replyCount, setReplyCount] = useState(message._count?.replies || 0);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const isOwner = message.user.clerkId === user?.id;
  const isEditing = editingId === message.id;
  const showReplies = !isThread && replyCount > 0;

  useEffect(() => {
    if (isThread) return;

    const channel = pusherClient.subscribe(message.channelId);
    
    const handleUpdate = (updatedMessage: MessageWithUser) => {
      if (updatedMessage.id === message.id) {
        setReplyCount(updatedMessage._count?.replies || 0);
      }
    };

    channel.bind("message-update", handleUpdate);

    return () => {
      channel.unbind("message-update", handleUpdate);
      pusherClient.unsubscribe(message.channelId);
    };
  }, [message.id, message.channelId, isThread]);

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

  return (
    <div className="group relative flex items-start gap-x-3 py-2 px-1 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-md">
      <img
        src={message.user.imageUrl || "/placeholder-avatar.png"}
        alt={message.user.name}
        className="h-8 w-8 rounded-full"
      />
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-x-2">
          <p className="font-medium text-sm hover:underline">
            {message.user.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(message.createdAt), "p")}
          </p>
          {message.updatedAt !== message.createdAt && (
            <p className="text-[10px] text-muted-foreground uppercase">
              edited
            </p>
          )}
        </div>
        {isEditing ? (
          <div className="flex items-center gap-x-2 mt-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 resize-none p-2 h-[70px] min-w-0"
              disabled={isLoading}
              placeholder="Use markdown for formatting"
            />
            <div className="flex flex-col gap-y-2">
              <Button
                onClick={onEdit}
                size="sm"
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
                size="sm"
                variant="ghost"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col gap-y-1"
            onClick={() => !isThread && onThreadClick?.(message)}
          >
            <Markdown 
              content={message.content} 
              className="text-sm break-words"
            />
            <MessageReactions
              messageId={message.id}
              channelId={message.channelId}
            />
            {showReplies && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onThreadClick?.(message);
                }}
                className="flex items-center gap-x-2 text-xs text-muted-foreground hover:text-primary transition w-fit mt-1"
              >
                <MessageCircle className="h-3 w-3" />
                {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        )}
      </div>
      {!isEditing && (
        <TooltipProvider>
          <div className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 flex items-center gap-x-2 bg-background/95 py-1 px-1 rounded-md shadow-sm border">
            <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <SmilePlus className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Add reaction</TooltipContent>
              </Tooltip>
              <PopoverContent 
                className="w-full p-0 border-none" 
                side="top" 
                align="end"
              >
                <Picker
                  data={data}
                  onEmojiSelect={onEmojiSelect}
                  theme="light"
                  previewPosition="none"
                  skinTonePosition="none"
                />
              </PopoverContent>
            </Popover>
            {!isThread && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onThreadClick?.(message);
                    }}
                  >
                    <Reply className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply in thread</TooltipContent>
              </Tooltip>
            )}
            {isOwner && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(message.id);
                        setEditContent(message.content);
                      }}
                      size="icon"
                      variant="ghost"
                      disabled={isLoading}
                      className="h-7 w-7"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit message</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      size="icon"
                      variant="ghost"
                      disabled={isLoading}
                      className="h-7 w-7"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete message</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </TooltipProvider>
      )}
    </div>
  );
} 