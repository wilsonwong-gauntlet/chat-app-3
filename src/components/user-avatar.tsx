import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { usePresence } from "@/providers/presence-provider";
import { PresenceIndicator } from "@/components/presence-indicator";

interface UserAvatarProps {
  userId: string;
  imageUrl?: string | null;
  name: string;
  className?: string;
  showPresence?: boolean;
}

export function UserAvatar({ 
  userId,
  imageUrl, 
  name,
  className,
  showPresence = true,
}: UserAvatarProps) {
  const { onlineUsers } = usePresence();
  const presence = onlineUsers[userId]?.presence || "OFFLINE";

  return (
    <div className="relative">
      <Avatar className={cn("h-8 w-8", className)}>
        <AvatarImage src={imageUrl || undefined} />
        <AvatarFallback>
          {name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showPresence && (
        <PresenceIndicator
          className="absolute bottom-0 right-0"
          status={presence}
        />
      )}
    </div>
  );
} 