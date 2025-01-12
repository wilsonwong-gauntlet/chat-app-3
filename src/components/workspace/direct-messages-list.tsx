"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Channel, ChannelType, ChannelMember, User } from "@/types";
import { UserAvatar } from "@/components/user-avatar";
import { usePresence } from "@/providers/presence-provider";
import { MemberListPopover } from "./member-list-popover";

interface DirectMessagesListProps {
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
  members: {
    user: User;
  }[];
}

export function DirectMessagesList({ channels, members }: DirectMessagesListProps) {
  const params = useParams();
  const { user: currentUser } = useUser();
  const { onlineUsers } = usePresence();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const dmChannels = channels.filter(channel => channel.type === ChannelType.DIRECT);
  
  const getOtherUser = (channel: Channel & {
    members: (ChannelMember & {
      user: {
        id: string;
        name: string;
        imageUrl: string | null;
        clerkId: string;
      };
    })[];
  }) => {
    const otherMember = channel.members?.find(
      (member) => member.user.clerkId !== currentUser?.id
    );
    return otherMember?.user;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Direct Messages
        </h2>
        <MemberListPopover
          members={members}
          trigger={
            <Button
              size="icon"
              variant="ghost"
              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Start a conversation"
            >
              <Plus className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      <div className="space-y-[2px]">
        {dmChannels.map((channel) => {
          const otherUser = getOtherUser(channel);
          const isActive = params.channelId === channel.id;

          if (!otherUser) return null;

          return (
            <Link
              key={channel.id}
              href={`/workspaces/${params.workspaceId}/channels/${channel.id}`}
              className={cn(
                "group flex items-center gap-x-2 px-2 py-1.5 rounded-md w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition-colors",
                isActive && "bg-zinc-700/10 dark:bg-zinc-700/50"
              )}
              onMouseEnter={() => setSelectedId(channel.id)}
              onMouseLeave={() => setSelectedId(null)}
            >
              <div className="flex-shrink-0">
                <UserAvatar
                  userId={otherUser.id}
                  imageUrl={otherUser.imageUrl}
                  name={otherUser.name}
                  className="h-5 w-5"
                />
              </div>
              <span className={cn(
                "text-sm text-zinc-500 dark:text-zinc-400 truncate",
                isActive && "text-zinc-700 dark:text-zinc-300 font-medium"
              )}>
                {otherUser.name}
              </span>
            </Link>
          );
        })}
      </div>

      {dmChannels.length === 0 && (
        <div className="px-2 text-xs text-zinc-500 dark:text-zinc-400">
          No conversations yet
        </div>
      )}
    </div>
  );
} 