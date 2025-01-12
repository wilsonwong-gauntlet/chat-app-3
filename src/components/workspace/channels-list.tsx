"use client";

import { Lock, Plus, Hash } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { Channel, ChannelType, ChannelMember } from "@/types";
import { useWorkspace } from "@/providers/workspace-provider";

interface ChannelsListProps {
  channels: (Channel & {
    members: (ChannelMember & {
      user: {
        id: string;
        name: string;
        imageUrl: string | null;
        clerkId: string;
      };
    })[];
  })[];
}

export function ChannelsList({ channels }: ChannelsListProps) {
  const params = useParams();
  const { onOpen } = useModal();
  const { workspace } = useWorkspace();
  const { user } = useUser();

  const regularChannels = channels.filter(
    channel => {
      if (channel.type === ChannelType.DIRECT) return false;
      if (channel.type === ChannelType.PRIVATE) {
        return channel.members.some(member => member.user.clerkId === user?.id);
      }
      return true;
    }
  );

  const handleCreateChannel = () => {
    if (!workspace) return;
    onOpen("createChannel");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Channels
        </h2>
        <Button
          onClick={handleCreateChannel}
          size="icon"
          variant="ghost"
          className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-[2px]">
        {regularChannels.map((channel) => {
          const isActive = params.channelId === channel.id;

          return (
            <Link
              key={channel.id}
              href={`/workspaces/${params.workspaceId}/channels/${channel.id}`}
              className={cn(
                "group flex items-center gap-x-2 px-2 py-1.5 rounded-md w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition-colors",
                isActive && "bg-zinc-700/10 dark:bg-zinc-700/50"
              )}
            >
              {channel.type === ChannelType.PRIVATE ? (
                <Lock className="flex-shrink-0 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              ) : (
                <Hash className="flex-shrink-0 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              )}
              <span className={cn(
                "text-sm text-zinc-500 dark:text-zinc-400 truncate",
                isActive && "text-zinc-700 dark:text-zinc-300 font-medium"
              )}>
                {channel.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 