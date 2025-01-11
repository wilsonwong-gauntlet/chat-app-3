"use client";

import { Channel, ChannelMember } from "@/types";
import { ChannelsList } from "./channels-list";
import { DirectMessagesList } from "./direct-messages-list";
import { StartDMDialog } from "./start-dm-dialog";
import { Settings, ChevronDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
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
import { formatDistanceToNow } from "date-fns";
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

  if (!workspace) return null;

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <div className="p-3 flex items-center gap-2">
        <div className="rounded-md bg-zinc-100 dark:bg-zinc-800 p-1">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8"
              }
            }}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex-1 flex items-center justify-between p-2 rounded-md hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
              <h2 className="text-lg font-semibold truncate">
                {workspace.name}
              </h2>
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
      <ChannelsList channels={channels} />
      <DirectMessagesList channels={channels} />
      <StartDMDialog members={members} />
    </div>
  );
} 