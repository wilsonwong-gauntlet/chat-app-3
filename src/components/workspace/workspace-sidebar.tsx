"use client";

import { Channel, ChannelMember } from "@/types";
import { ChannelsList } from "./channels-list";
import { DirectMessagesList } from "./direct-messages-list";
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
import { UserMenu } from "@/components/user-menu";

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
  const { workspace } = useWorkspace();
  const { onOpen } = useModal();
  const router = useRouter();

  if (!workspace) return null;

  return (
    <div className="flex flex-col h-full w-60 bg-zinc-50 dark:bg-zinc-900 border-r border-r-zinc-200 dark:border-r-zinc-700">
      <div className="p-2">
        <UserMenu />
      </div>
      <div className="p-2 border-b border-b-zinc-200 dark:border-b-zinc-700">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-3 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50"
            >
              <span className="font-semibold truncate">
                {workspace.name}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Button>
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
        <DirectMessagesList channels={channels} members={members} />
      </ScrollArea>
    </div>
  );
} 