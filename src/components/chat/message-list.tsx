import { Message, User, Reaction } from "@prisma/client";
import { MessageItem } from "./message-item";

interface MessageWithUser extends Message {
  user: User;
  reactions: Reaction[];
}

interface MessageListProps {
  messages: MessageWithUser[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-sm text-slate-500">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isOwn={message.userId === "currentUserId"} // TODO: Replace with actual user ID
        />
      ))}
    </div>
  );
} 