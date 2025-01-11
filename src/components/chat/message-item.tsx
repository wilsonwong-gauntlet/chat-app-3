"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MessageWithUser } from "@/types";
import { SmilePlus, Reply, Edit2, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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

interface MessageItemProps {
  message: MessageWithUser;
  onThreadClick?: (message: MessageWithUser) => void;
  isThread?: boolean;
}

export function MessageItem({
  message,
  onThreadClick,
  isThread = false
}: MessageItemProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  
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

  return (
    <div className="group relative flex items-start gap-4 px-4 py-3 hover:bg-zinc-50 transition-colors">
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
            <p className="text-sm font-medium">
              {message.user.name}
            </p>
            <span className="text-xs text-zinc-500">
              {formatTimestamp(message.createdAt)}
            </span>
          </div>
          {message.updatedAt > message.createdAt && (
            <span className="text-[10px] text-zinc-400">
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
                className="flex-1 resize-none p-2 h-[70px] min-w-0 bg-zinc-50 border-zinc-200"
                disabled={isLoading}
                placeholder="Edit your message..."
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={onEdit}
                  size="sm"
                  variant="ghost"
                  disabled={isLoading || !editContent.trim()}
                  className="h-7 w-7 text-zinc-500 hover:text-zinc-600"
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
                  className="h-7 w-7 text-zinc-500 hover:text-zinc-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm text-zinc-600 whitespace-pre-wrap">
                {message.content}
              </div>
              {message.fileUrl && (
                <a 
                  href={message.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-sm text-blue-500 hover:underline"
                >
                  Attachment
                </a>
              )}
              <MessageReactions
                messageId={message.id}
                channelId={message.channelId}
              />
            </>
          )}
        </div>
        {!isThread && !isEditing && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              onClick={() => onThreadClick?.(message)}
              size="sm"
              variant="ghost"
              className="text-xs text-zinc-500 hover:text-zinc-600"
            >
              {message._count?.replies || 0} replies
            </Button>
          </div>
        )}
      </div>
      {!isEditing && (
        <TooltipProvider>
          <div className="opacity-0 group-hover:opacity-100 absolute right-4 top-2 flex items-center gap-1 bg-white shadow-sm border border-zinc-200 rounded-md py-1 px-1 transition-opacity">
            <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-500 hover:text-zinc-600"
                    >
                      <SmilePlus className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-white text-zinc-600">
                  Add reaction
                </TooltipContent>
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
                    onClick={() => onThreadClick?.(message)}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-500 hover:text-zinc-600"
                  >
                    <Reply className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-white text-zinc-600">
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
                      className="h-7 w-7 text-zinc-500 hover:text-zinc-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white text-zinc-600">
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
                      className="h-7 w-7 text-zinc-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white text-zinc-600">
                    Delete message
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </TooltipProvider>
      )}
    </div>
  );
} 