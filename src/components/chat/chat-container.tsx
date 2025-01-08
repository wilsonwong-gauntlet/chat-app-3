import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { Message } from "@prisma/client";

interface ChatContainerProps {
  channelId: string;
  messages: Message[];
  isLoading?: boolean;
  onSendMessage: (content: string, fileUrl?: string) => void;
}

export function ChatContainer({ 
  channelId, 
  messages, 
  isLoading,
  onSendMessage 
}: ChatContainerProps) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <ScrollArea className="flex-1 p-4">
        <MessageList messages={messages} isLoading={isLoading} />
      </ScrollArea>
      <div className="p-4 border-t">
        <MessageInput channelId={channelId} onSend={onSendMessage} />
      </div>
    </div>
  );
} 