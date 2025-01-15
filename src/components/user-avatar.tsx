import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { usePresence } from "@/providers/presence-provider";
import { PresenceIndicator } from "@/components/presence-indicator";

interface UserAvatarProps {
  userId: string;
  clerkId: string;
  imageUrl?: string | null;
  name: string;
  className?: string;
  showPresence?: boolean;
}

export function UserAvatar({ 
  userId,
  clerkId,
  imageUrl, 
  name,
  className,
  showPresence = true,
}: UserAvatarProps) {
  const { onlineUsers } = usePresence();
  const presence = onlineUsers[clerkId]?.presence || "OFFLINE";

  // Get initials from name, handle empty/null cases
  const getInitials = (name: string) => {
    if (!name || name.trim() === "") return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="relative">
      <Avatar className={cn("h-8 w-8", className)}>
        <AvatarImage src={imageUrl || undefined} />
        <AvatarFallback>
          {getInitials(name)}
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