"use client";

import { cn } from "@/lib/utils";
import { PresenceStatus } from "@/types";

interface PresenceIndicatorProps {
  status: PresenceStatus;
  className?: string;
}

const statusColors = {
  [PresenceStatus.ONLINE]: "bg-emerald-500",
  [PresenceStatus.OFFLINE]: "bg-zinc-500",
  [PresenceStatus.AWAY]: "bg-yellow-500",
  [PresenceStatus.DND]: "bg-rose-500",
};

export function PresenceIndicator({ status, className }: PresenceIndicatorProps) {
  return (
    <div
      className={cn(
        "h-2.5 w-2.5 rounded-full border-2 border-white dark:border-zinc-900",
        statusColors[status],
        className
      )}
    />
  );
} 