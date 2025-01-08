import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PaperclipIcon, SendIcon } from "lucide-react";
import { FileUpload } from "@/components/file-upload";

interface MessageInputProps {
  channelId: string;
  onSend: (content: string, fileUrl?: string) => void;
}

export function MessageInput({ channelId, onSend }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!content.trim() && !isUploading) return;
    onSend(content);
    setContent("");
    textareaRef.current?.focus();
  };

  return (
    <div className="flex items-end space-x-2">
      <div className="flex-1">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="min-h-[60px] resize-none"
          rows={1}
        />
      </div>
      <div className="flex space-x-2">
        <FileUpload
          endpoint="messageFile"
          onChange={(url) => {
            if (url) {
              onSend("", url);
            }
          }}
        >
          <Button
            size="icon"
            variant="ghost"
            className="h-[60px]"
            disabled={isUploading}
          >
            <PaperclipIcon className="h-5 w-5" />
          </Button>
        </FileUpload>
        <Button
          size="icon"
          className="h-[60px]"
          onClick={handleSend}
          disabled={!content.trim() && !isUploading}
        >
          <SendIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
} 