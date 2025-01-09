"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Hash, Lock } from "lucide-react";
import { Channel } from "@prisma/client";

import { useWorkspace } from "@/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChannelWithMembers extends Channel {
  members: {
    user: {
      id: string;
      name: string;
      imageUrl: string | null;
    }
  }[];
}

export function ChannelList() {
  const { workspace } = useWorkspace();
  const params = useParams();

  if (!workspace) return null;

  return (
    <div className="space-y-[2px]">
      {workspace.channels.map((channel: ChannelWithMembers) => {
        const isActive = params?.channelId === channel.id;

        return (
          <Button
            key={channel.id}
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              "w-full justify-start px-2",
              isActive && "bg-zinc-700/50 dark:bg-zinc-700",
              !isActive && "hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50"
            )}
          >
            <Link href={`/workspaces/${workspace.id}/channels/${channel.id}`}>
              {channel.type === "PRIVATE" ? (
                <Lock className="h-4 w-4 mr-2 text-zinc-400" />
              ) : (
                <Hash className="h-4 w-4 mr-2 text-zinc-400" />
              )}
              <span className="truncate text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                {channel.name}
              </span>
            </Link>
          </Button>
        );
      })}
    </div>
  );
} 