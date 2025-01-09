import { UserStatus } from "@/hooks/use-presence";
import { cn } from "@/lib/utils";

interface UserStatusIndicatorProps {
  status: UserStatus;
  className?: string;
}

export function UserStatusIndicator({ status, className }: UserStatusIndicatorProps) {
  const statusColor = {
    ONLINE: "bg-emerald-500",
    OFFLINE: "bg-zinc-500",
    AWAY: "bg-amber-500",
    DO_NOT_DISTURB: "bg-rose-500"
  }[status];

  return (
    <div 
      className={cn(
        "h-3 w-3 rounded-full",
        statusColor,
        className
      )}
    />
  );
}

interface UserStatusBadgeProps {
  status: UserStatus;
  statusMessage?: string;
  className?: string;
}

export function UserStatusBadge({ status, statusMessage, className }: UserStatusBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <UserStatusIndicator status={status} />
      <span className="text-sm text-muted-foreground">
        {status.toLowerCase()}
        {statusMessage && ` - ${statusMessage}`}
      </span>
    </div>
  );
} 