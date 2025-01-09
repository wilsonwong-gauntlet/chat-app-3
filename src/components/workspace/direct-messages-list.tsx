"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Channel, User } from "@/types";

interface DirectMessagesListProps {
  workspaceId: string;
  initialChannels: (Channel & {
    members: {
      user: Pick<User, "id" | "name" | "imageUrl">;
    }[];
  })[];
}

export function DirectMessagesList({
  workspaceId,
  initialChannels
}: DirectMessagesListProps) {
  const params = useParams();
  const [channels, setChannels] = useState(initialChannels);

  // Filter only DM channels
  const dmChannels = channels.filter(channel => channel.type === "DIRECT");

  return (
    <div className="px-2">
      <div className="flex items-center justify-between py-2">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          Direct Messages
        </h2>
      </div>
      <ScrollArea className="gap-y-2">
        {dmChannels.map((channel) => {
          // For DMs, we want to show the other user's name
          const otherMember = channel.members[0]?.user;
          
          return (
            <Link
              key={channel.id}
              href={`/workspaces/${workspaceId}/channels/${channel.id}`}
              className={cn(
                "group relative flex items-center gap-x-2 rounded-md px-2 py-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 mb-1",
                params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
              )}
            >
              <MessageSquare className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <span className="line-clamp-1 font-medium text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
                {otherMember?.name || "Unknown User"}
              </span>
            </Link>
          );
        })}
      </ScrollArea>
    </div>
  );
} 