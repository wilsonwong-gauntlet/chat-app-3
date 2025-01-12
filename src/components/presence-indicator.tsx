"use client";

import { cn } from "@/lib/utils";
import { PresenceStatus } from "@/types";

interface PresenceIndicatorProps {
  presence: PresenceStatus;
  className?: string;
}

export function PresenceIndicator({
  presence,
  className
}: PresenceIndicatorProps) {
  const color = {
    ONLINE: "bg-green-500",
    OFFLINE: "bg-gray-500",
    AWAY: "bg-yellow-500",
    DND: "bg-red-500"
  }[presence] || "bg-gray-500";

  return (
    <div
      className={cn(
        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-800",
        color,
        className
      )}
    />
  );
} 