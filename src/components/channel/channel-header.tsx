"use client";

import { Hash, Lock } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import { Channel, ChannelMember, ChannelType } from "@/types";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useUser } from "@clerk/nextjs";
import { usePresence } from "@/providers/presence-provider";
import { cn } from "@/lib/utils";

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
  const { user } = useUser();
  const { onlineUsers } = usePresence();

  const handleChannelClick = () => {
    onOpen("channelDetails", { channel });
  };

  if (channel.type === ChannelType.DIRECT) {
    const otherMember = channel.members.find(
      member => member.user.clerkId !== user?.id
    );
    
    if (!otherMember) return null;

    const presence = otherMember.user.clerkId ? 
      onlineUsers[otherMember.user.clerkId]?.presence : 
      null;
    
    return (
      <header className="h-12 border-b flex items-center px-4 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-x-2">
          <div className="relative">
            <UserAvatar
              userId={otherMember.user.id}
              imageUrl={otherMember.user.imageUrl}
              name={otherMember.user.name}
              className="h-8 w-8"
            />
            <div className={cn(
              "absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white dark:border-zinc-900",
              presence === "ONLINE" && "bg-emerald-500",
              presence === "AWAY" && "bg-yellow-500",
              presence === "DND" && "bg-rose-500",
              presence === "OFFLINE" && "bg-zinc-500"
            )} />
          </div>
          <span className="font-semibold text-md text-zinc-500 dark:text-zinc-400">
            {otherMember.user.name}
          </span>
        </div>
      </header>
    );
  }

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