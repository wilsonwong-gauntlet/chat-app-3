"use client";

import { Plus, Pin, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useModal } from "@/hooks/use-modal-store";
import { Channel, ChannelType, ChannelMember } from "@/types";
import { UserAvatar } from "@/components/user-avatar";
import { usePresence } from "@/providers/presence-provider";
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
}

export function DirectMessagesList({ channels }: DirectMessagesListProps) {
  const params = useParams();
  const { user: currentUser } = useUser();
  const { onOpen } = useModal();
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpen("startDM");
      }
      
      // Arrow key navigation for DM list
      if (document.activeElement?.tagName === "BODY") {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const currentIndex = dmChannels.findIndex(c => c.id === selectedId);
          const nextIndex = e.key === "ArrowUp" 
            ? Math.max(0, currentIndex - 1)
            : Math.min(dmChannels.length - 1, currentIndex + 1);
          setSelectedId(dmChannels[nextIndex]?.id || null);
        }
        if (e.key === "Enter" && selectedId) {
          const channel = dmChannels.find(c => c.id === selectedId);
          if (channel) {
            window.location.href = `/workspaces/${params.workspaceId}/channels/${channel.id}`;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dmChannels, selectedId, onOpen, params.workspaceId]);

  const sortedChannels = [...dmChannels].sort((a, b) => {
    // Pinned items first
    if (pinnedDMs.includes(a.id) && !pinnedDMs.includes(b.id)) return -1;
    if (!pinnedDMs.includes(a.id) && pinnedDMs.includes(b.id)) return 1;
    
    // Then by most recent message
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2 py-1">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Direct Messages</h2>
        <Button
          onClick={() => onOpen("startDM")}
          size="icon"
          variant="ghost"
          className="h-4 w-4 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="h-4 w-4" />
        </Button>
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