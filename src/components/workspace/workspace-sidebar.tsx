"use client";

import { Channel, ChannelMember } from "@/types";
import { ChannelsList } from "./channels-list";
import { DirectMessagesList } from "./direct-messages-list";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWorkspace } from "@/providers/workspace-provider";
import { useModal } from "@/hooks/use-modal-store";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";

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
      <div className="p-2 border-b border-b-zinc-200 dark:border-b-zinc-700">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-3 py-5 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 font-semibold"
            >
              {workspace.name}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56" 
            align="start" 
            alignOffset={11} 
            forceMount
          >
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
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <ChannelsList channels={channels} />
          </div>
          <div className="space-y-2">
            <DirectMessagesList channels={channels} members={members} />
          </div>
        </div>
      </ScrollArea>
      <div className="mt-auto border-t border-t-zinc-200 dark:border-t-zinc-700">
        <div className={cn(
          "p-2 mx-2 my-2 rounded-md transition-colors",
          "hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50"
        )}>
          <UserMenu />
        </div>
      </div>
    </div>
  );
} 