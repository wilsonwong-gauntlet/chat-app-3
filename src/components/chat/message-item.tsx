import { Message, User, Reaction } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MessageWithUser extends Message {
  user: User;
  reactions: Reaction[];
}

interface MessageItemProps {
  message: MessageWithUser;
  isOwn?: boolean;
}

export function MessageItem({ message, isOwn }: MessageItemProps) {
  return (
    <div className={cn("flex items-start space-x-4", isOwn && "flex-row-reverse space-x-reverse")}>
      <Avatar>
        <AvatarImage src={message.user.imageUrl || ""} />
        <AvatarFallback>{message.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-semibold">{message.user.name}</span>
          <span className="text-xs text-slate-500">
            {format(new Date(message.createdAt), "p")}
          </span>
        </div>
        <div className="mt-1">
          {message.fileUrl ? (
            <div className="mt-2">
              <img
                src={message.fileUrl}
                alt="Attachment"
                className="max-w-sm rounded-lg"
              />
            </div>
          ) : (
            <p className="text-sm">{message.content}</p>
          )}
        </div>
        {message.reactions.length > 0 && (
          <div className="flex gap-1 mt-2">
            {message.reactions.map((reaction) => (
              <div
                key={`${reaction.messageId}-${reaction.emoji}`}
                className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-1"
              >
                <span>{reaction.emoji}</span>
                <span className="text-xs">1</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 