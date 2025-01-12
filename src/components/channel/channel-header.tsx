"use client";

import { Hash, Lock } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import { Channel, ChannelMember, ChannelType } from "@/types";
import { Button } from "@/components/ui/button";

interface ChannelHeaderProps {
  channel: Channel & {
    members: (ChannelMember & {
      user: {
        id: string;
        name: string;
        imageUrl: string | null;
        clerkId: string;
      };
    })[];
  };
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
  const { onOpen } = useModal();

  const handleChannelClick = () => {
    onOpen("channelDetails", { channel });
  };

  return (
    <header className="h-12 border-b flex items-center px-4 justify-between bg-white dark:bg-zinc-900">
      <Button 
        onClick={handleChannelClick}
        variant="ghost"
        className="px-1 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50"
      >
        <div className="flex items-center gap-x-2">
          {channel.type === ChannelType.PRIVATE ? (
            <Lock className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          ) : (
            <Hash className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          )}
          <span className="font-semibold text-md text-zinc-500 dark:text-zinc-400">
            {channel.name}
          </span>
          {(channel.description || channel.members.length > 0) && (
            <>
              <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-700" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-[400px]">
                {channel.description}
                {channel.description && channel.members.length > 0 && " · "}
                {channel.members.length > 0 && `${channel.members.length} members`}
              </span>
            </>
          )}
        </div>
      </Button>
    </header>
  );
} 