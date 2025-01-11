import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  userId: string;
  imageUrl?: string | null;
  name: string;
  className?: string;
}

export function UserAvatar({ 
  userId,
  imageUrl, 
  name,
  className,
}: UserAvatarProps) {
  return (
    <div className="relative">
      <Avatar className={cn("h-8 w-8", className)}>
        <AvatarImage src={imageUrl || undefined} />
        <AvatarFallback>
          {name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
} 