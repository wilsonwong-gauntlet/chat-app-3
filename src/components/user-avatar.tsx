import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserStatusIndicator } from "@/components/user-status";
import { usePresenceStore } from "@/hooks/use-presence";
import { cn } from "@/lib/utils";

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
  showPresence = true
}: UserAvatarProps) {
  const userPresence = usePresenceStore(
    (state) => state.userPresence[userId]
  );

  return (
    <div className="relative">
      <Avatar className={cn("h-8 w-8", className)}>
        <AvatarImage src={imageUrl || undefined} />
        <AvatarFallback>
          {name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showPresence && userPresence && (
        <div className="absolute bottom-0 right-0 ring-2 ring-background rounded-full">
          <UserStatusIndicator 
            status={userPresence.status}
            className="h-2.5 w-2.5"
          />
        </div>
      )}
    </div>
  );
} 