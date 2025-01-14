"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SendHorizontal, Bold, Italic, Code, Paperclip, X, File, Link2, Strikethrough, CodeSquare } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BoldExtension from '@tiptap/extension-bold';
import ItalicExtension from '@tiptap/extension-italic';
import CodeExtension from '@tiptap/extension-code';
import CodeBlockExtension from '@tiptap/extension-code-block';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Strike from '@tiptap/extension-strike';

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { validateFile, getFileType } from "@/lib/s3";
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
  action: () => void;
}

export function MessageInput({
  channelId,
  parentId
}: MessageInputProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        horizontalRule: false,
        blockquote: false,
        codeBlock: false,
      }),
      BoldExtension,
      ItalicExtension,
      CodeExtension,
      CodeBlockExtension.configure({
        HTMLAttributes: {
          class: 'rounded-md bg-zinc-100 dark:bg-zinc-800 p-4 font-mono text-sm',
        },
      }),
      Strike,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-500 hover:underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: parentId 
          ? 'Reply to thread...' 
          : `Message ${parentId ? "thread" : "#channel"}`,
      }),
      CharacterCount.configure({
        limit: 2000,
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert prose-zinc max-w-none focus:outline-none min-h-[44px] max-h-[60vh] overflow-y-auto px-2 py-1',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          handleFileSelection(file);
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (event.clipboardData?.files?.length) {
          const file = event.clipboardData.files[0];
          handleFileSelection(file);
          return true;
        }
        return false;
      },
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  const handleFileSelection = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      // TODO: Add toast notification
      console.error(error);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { fileUrl } = await response.json();
      handleFileUpload(fileUrl);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const formatButtons: FormatButton[] = [
    { 
      icon: Bold, 
      label: "Bold", 
      format: "**", 
      tooltip: "Bold text (Ctrl+B)",
      action: () => editor?.chain().focus().toggleBold().run()
    },
    { 
      icon: Italic, 
      label: "Italic", 
      format: "_", 
      tooltip: "Italic text (Ctrl+I)",
      action: () => editor?.chain().focus().toggleItalic().run()
    },
    { 
      icon: Code, 
      label: "Code", 
      format: "`", 
      tooltip: "Code snippet (Ctrl+Shift+C)",
      action: () => editor?.chain().focus().toggleCode().run()
    },
    { 
      icon: CodeSquare, 
      label: "CodeBlock", 
      format: "```", 
      tooltip: "Code block (Ctrl+Alt+C)",
      action: () => editor?.chain().focus().toggleCodeBlock().run()
    },
    { 
      icon: Strikethrough, 
      label: "Strike", 
      format: "~~", 
      tooltip: "Strikethrough text (Ctrl+Shift+X)",
      action: () => editor?.chain().focus().toggleStrike().run()
    },
    { 
      icon: Link2, 
      label: "Link", 
      format: "", 
      tooltip: "Add link (Ctrl+K)",
      action: () => {
        const url = window.prompt('Enter URL:');
        if (url) {
          editor?.chain().focus().setLink({ href: url }).run();
        }
      }
    },
    {
      icon: Paperclip,
      label: "Attachment",
      format: "",
      tooltip: "Attach file",
      action: () => setIsAttachmentOpen(true)
    }
  ];

  const onSubmit = async () => {
    if ((!editor?.getText().trim() && !fileUrl) || !editor) return;
    
    try {
      setIsLoading(true);

      // Clean up the HTML content
      const content = editor.getHTML()
        .trim()
        // Remove wrapping p tags if it's just a single paragraph
        .replace(/^<p>(.*)<\/p>$/, '$1')
        // Remove empty paragraphs
        .replace(/<p><\/p>/g, '');

      const response = await fetch(`/api/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: content || "Shared a file",
          parentId,
          fileUrl: fileUrl || null
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      editor.commands.clearContent();
      setFileUrl(null);
      router.refresh();
      editor.commands.focus();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (url: string) => {
    setFileUrl(url);
    setIsAttachmentOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && editor?.isFocused) {
        e.preventDefault();
        onSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  return (
    <div className="px-4 py-4 bg-white border-t border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700">
      <TooltipProvider>
        <div 
          className={cn(
            "relative flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 transition-shadow duration-200",
            isFocused && "shadow-[0_2px_12px_-3px_rgba(0,0,0,0.1),_0_2px_4px_-2px_rgba(0,0,0,0.05)]"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer?.files?.length) {
              handleFileSelection(e.dataTransfer.files[0]);
            }
          }}
        >
          <div className="flex items-center gap-0.5 border-b border-zinc-100 dark:border-zinc-700 px-3 py-2">
            {formatButtons.map(({ icon: Icon, label, tooltip, action }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300",
                      editor?.isActive(label.toLowerCase()) && "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-300"
                    )}
                    onClick={action}
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
              <DialogContent>
                <VisuallyHidden.Root>
                  <DialogTitle>
                    Upload File Attachment
                  </DialogTitle>
                </VisuallyHidden.Root>
                <FileAttachment
                  onFileUpload={handleFileUpload}
                  onClose={() => setIsAttachmentOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          {fileUrl && (
            <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                {getFileType(fileUrl) === "image" ? (
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      onClick={() => setIsPreviewOpen(true)}
                      className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src={fileUrl}
                        alt="Attached image"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Image attached
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Click to preview
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 flex-1">
                    <a 
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 flex-1 hover:opacity-90 transition-opacity"
                    >
                      <div className="h-10 w-10 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <File className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                          {fileUrl.split("/").pop()}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Click to download
                        </span>
                      </div>
                    </a>
                  </div>
                )}
                <Button
                  onClick={() => setFileUrl(null)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          <div className="relative flex items-center p-2">
            <div className="relative flex-1">
              <EditorContent 
                editor={editor} 
                className="text-zinc-600 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
              {editor && (
                <div className="absolute bottom-1 right-2 text-xs text-zinc-400 dark:text-zinc-500 pointer-events-none">
                  {editor.storage.characterCount.characters()}/2000
                </div>
              )}
            </div>
            <div className="flex items-center px-2">
              <Button
                onClick={onSubmit}
                disabled={
                  (!editor?.getText().trim() && !fileUrl) || 
                  isLoading || 
                  (editor?.storage.characterCount.characters() || 0) > 2000
                }
                size="icon"
                variant="ghost"
                className={cn(
                  "h-8 w-8 transition-opacity hover:bg-zinc-100 dark:hover:bg-zinc-700",
                  (!editor?.getText().trim() && !fileUrl) && "opacity-50"
                )}
              >
                <SendHorizontal className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </Button>
            </div>
          </div>
        </div>
      </TooltipProvider>
      {fileUrl && getFileType(fileUrl) === "image" && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-0">
            <VisuallyHidden.Root>
              <DialogTitle>
                Image Preview
              </DialogTitle>
            </VisuallyHidden.Root>
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={fileUrl}
                alt="Preview"
                fill
                className="object-contain"
                priority
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 