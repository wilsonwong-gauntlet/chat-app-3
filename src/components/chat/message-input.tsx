"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SendHorizontal, Bold, Italic, Code, Paperclip } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FileAttachment } from "./file-attachment";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

interface MessageInputProps {
  channelId: string;
  parentId?: string;
}

interface FormatButton {
  icon: React.ElementType;
  label: string;
  format: string;
  tooltip: string;
}

export function MessageInput({
  channelId,
  parentId
}: MessageInputProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const formatButtons: FormatButton[] = [
    { icon: Bold, label: "Bold", format: "**", tooltip: "Bold text (Ctrl+B)" },
    { icon: Italic, label: "Italic", format: "_", tooltip: "Italic text (Ctrl+I)" },
    { icon: Code, label: "Code", format: "`", tooltip: "Code snippet (Ctrl+Shift+C)" },
  ];

  const onSubmit = async () => {
    if (!content.trim() && !fileUrl) return;
    
    try {
      setIsLoading(true);

      const response = await fetch(`/api/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: content.trim() || "Shared a file",
          parentId,
          fileUrl
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setContent("");
      setFileUrl(null);
      router.refresh();
      textareaRef.current?.focus();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const newText = `${before}${format}${selected}${format}${after}`;
    setContent(newText);

    // Force update in next tick to ensure textarea value is updated
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + format.length,
        end + format.length
      );
    }, 0);
  };

  const handleFileUpload = (url: string) => {
    setFileUrl(url);
    setContent((prev) => prev.trim());
    setIsAttachmentOpen(false);
  };

  return (
    <div className="p-4 border-t">
      <TooltipProvider>
        <div className={cn(
          "relative flex flex-col rounded-lg border bg-background transition-shadow duration-200",
          isFocused && "shadow-md"
        )}>
          <div className="flex items-center gap-0.5 border-b px-2 py-1">
            {formatButtons.map(({ icon: Icon, label, format, tooltip }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7"
                    onClick={() => handleFormat(format)}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            ))}
            <Dialog open={isAttachmentOpen} onOpenChange={setIsAttachmentOpen}>
              <DialogTrigger asChild>
                <div
                  className="h-7 w-7 ml-auto flex items-center justify-center rounded-md hover:bg-accent cursor-pointer"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Paperclip className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Attach file
                    </TooltipContent>
                  </Tooltip>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle className="sr-only">
                  Upload File Attachment
                </DialogTitle>
                <FileAttachment
                  onFileUpload={handleFileUpload}
                  onClose={() => setIsAttachmentOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative flex items-center p-1">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  if (e.key === 'b') {
                    e.preventDefault();
                    handleFormat('**');
                  } else if (e.key === 'i') {
                    e.preventDefault();
                    handleFormat('_');
                  } else if (e.key === 'c' && e.shiftKey) {
                    e.preventDefault();
                    handleFormat('`');
                  }
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                parentId 
                  ? "Reply to thread..." 
                  : `Message ${parentId ? "thread" : "#channel"}`
              }
              className="resize-none border-0 focus-visible:ring-0 bg-transparent px-2 py-1 min-h-[44px] max-h-[60vh] overflow-y-auto"
              disabled={isLoading}
            />
            <div className="flex items-center px-2">
              <Button
                onClick={onSubmit}
                disabled={(!content.trim() && !fileUrl) || isLoading}
                size="icon"
                variant="ghost"
                className={cn(
                  "h-8 w-8 transition-opacity hover:bg-accent",
                  (!content.trim() && !fileUrl) && "opacity-50"
                )}
              >
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
} 