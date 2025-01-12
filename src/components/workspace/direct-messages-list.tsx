"use client";

import { Plus, Pin, X } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [pinnedDMs, setPinnedDMs] = useState<string[]>([]);
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

  const sortedChannels = [...dmChannels].sort((a, b) => {
    // Pinned items first
    if (pinnedDMs.includes(a.id) && !pinnedDMs.includes(b.id)) return -1;
    if (!pinnedDMs.includes(a.id) && pinnedDMs.includes(b.id)) return 1;
    
    // Then by most recent message
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2 py-1 group">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Direct Messages</h2>
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
        {sortedChannels.map((channel) => {
          const otherUser = getOtherUser(channel);
          const isOnline = otherUser?.clerkId ? 
            onlineUsers[otherUser.clerkId]?.presence === "ONLINE" : 
            false;
          const isActive = params.channelId === channel.id;
          const isPinned = pinnedDMs.includes(channel.id);

          return (
            <div
              key={channel.id}
              className={cn(
                "group relative flex items-center px-2 py-1.5 hover:bg-zinc-700/50 rounded-md transition-colors",
                isActive && "bg-zinc-700/50",
                selectedId === channel.id && "ring-1 ring-zinc-500"
              )}
              onMouseEnter={() => setSelectedId(channel.id)}
            >
              <Link
                href={`/workspaces/${params.workspaceId}/channels/${channel.id}`}
                className="flex-1 flex items-center gap-x-2 min-w-0"
              >
                <div className="relative flex-shrink-0">
                  <UserAvatar
                    userId={otherUser?.id || ""}
                    imageUrl={otherUser?.imageUrl}
                    name={otherUser?.name || "User"}
                    className="h-5 w-5"
                  />
                  <div className={cn(
                    "absolute bottom-0 right-0 h-2 w-2 rounded-full border border-zinc-800",
                    isOnline ? "bg-emerald-500" : "bg-zinc-500"
                  )} />
                </div>
                <span className="truncate text-sm text-zinc-300">
                  {otherUser?.name}
                </span>
              </Link>

              <div className="flex items-center gap-x-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-4 w-4 p-0">
                      {isPinned ? <Pin className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => setPinnedDMs(prev => 
                        isPinned 
                          ? prev.filter(id => id !== channel.id)
                          : [...prev, channel.id]
                      )}
                    >
                      {isPinned ? "Unpin conversation" : "Pin conversation"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {dmChannels.length === 0 && (
        <div className="px-2 py-1 text-xs text-zinc-500">
          No conversations yet
        </div>
      )}
    </div>
  );
} 