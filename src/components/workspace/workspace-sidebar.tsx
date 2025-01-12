"use client";

import { Channel, ChannelMember } from "@/types";
import { ChannelsList } from "./channels-list";
import { DirectMessagesList } from "./direct-messages-list";
import { StartDMDialog } from "./start-dm-dialog";
import { Settings, ChevronDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { UserStatusDialog } from "@/components/user-status-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWorkspace } from "@/providers/workspace-provider";
import { usePresence } from "@/providers/presence-provider";
import { useUser } from "@clerk/nextjs";
import { useModal } from "@/hooks/use-modal-store";

interface WorkspaceSidebarProps {
  channels: (Channel & {
    members: (ChannelMember & {
      user: {
        id: string;
        name: string;
        email: string;
        imageUrl: string | null;
        clerkId: string;
      };
    })[];
  })[];
  members: {
    user: {
      id: string;
      name: string;
      email: string;
      imageUrl: string | null;
      clerkId: string;
    };
  }[];
  availableWorkspaces: {
    id: string;
    name: string;
    createdAt: Date;
    _count: {
      members: number;
      channels: number;
    };
  }[];
}

export function WorkspaceSidebar({
  channels,
  members,
  availableWorkspaces
}: WorkspaceSidebarProps) {
  const router = useRouter();
  const { onOpen } = useModal();
  const { workspace } = useWorkspace();
  const { user } = useUser();
  const { onlineUsers } = usePresence();

  if (!workspace || !user) return null;

  const currentUserPresence = onlineUsers[user.id]?.presence || "OFFLINE";
  const currentUserStatus = onlineUsers[user.id]?.status;

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <div className="p-3 flex items-center gap-2">
        <UserStatusDialog
          trigger={
            <div className="rounded-md bg-zinc-100 dark:bg-zinc-800 p-1 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
              <UserAvatar
                userId={user.id}
                imageUrl={user.imageUrl || ""}
                name={user.fullName || user.username || "User"}
              />
            </div>
          }
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex-1 flex items-center justify-between p-2 rounded-md hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
              <div className="flex flex-col items-start">
                <h2 className="text-lg font-semibold truncate">
                  {workspace.name}
                </h2>
                {currentUserStatus && (
                  <p className="text-xs text-muted-foreground truncate">
                    {currentUserStatus}
                  </p>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" alignOffset={11} forceMount>
            <DropdownMenuItem
              className="w-full cursor-pointer px-3 py-2 text-sm"
              onClick={() => router.push("/workspaces")}
            >
              Switch Workspace
            </DropdownMenuItem>
            <DropdownMenuItem
              className="w-full cursor-pointer px-3 py-2 text-sm text-emerald-600"
              onClick={() => onOpen("createWorkspace")}
            >
              Create a New Workspace
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link 
                href={`/workspaces/${workspace.id}/settings`}
                className="w-full cursor-pointer px-3 py-2 text-sm text-zinc-500"
              >
                Workspace Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="flex-1">
        <ChannelsList channels={channels} />
        <DirectMessagesList channels={channels} />
      </ScrollArea>
      <StartDMDialog members={members} />
    </div>
  );
} 