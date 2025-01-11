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
          fileUrl: fileUrl || null
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
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
    <div className="px-4 py-4 bg-white border-t border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700">
      <TooltipProvider>
        <div className={cn(
          "relative flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 transition-shadow duration-200",
          isFocused && "shadow-[0_2px_12px_-3px_rgba(0,0,0,0.1),_0_2px_4px_-2px_rgba(0,0,0,0.05)]"
        )}>
          <div className="flex items-center gap-0.5 border-b border-zinc-100 dark:border-zinc-700 px-3 py-2">
            {formatButtons.map(({ icon: Icon, label, format, tooltip }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300"
                    onClick={() => handleFormat(format)}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            ))}
            <Dialog open={isAttachmentOpen} onOpenChange={setIsAttachmentOpen}>
              <DialogTrigger asChild>
                <div className="h-8 w-8 ml-auto flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Paperclip className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
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
          <div className="relative flex items-center p-2">
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
              className="resize-none border-0 focus-visible:ring-0 bg-transparent px-2 py-1 min-h-[44px] max-h-[60vh] overflow-y-auto placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              disabled={isLoading}
            />
            <div className="flex items-center px-2">
              <Button
                onClick={onSubmit}
                disabled={(!content.trim() && !fileUrl) || isLoading}
                size="icon"
                variant="ghost"
                className={cn(
                  "h-8 w-8 transition-opacity hover:bg-zinc-100 dark:hover:bg-zinc-700",
                  (!content.trim() && !fileUrl) && "opacity-50"
                )}
              >
                <SendHorizontal className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </Button>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
} 