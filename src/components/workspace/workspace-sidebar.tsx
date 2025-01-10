"use client";

import { Channel, ChannelMember } from "@/types";
import { ChannelsList } from "./channels-list";
import { DirectMessagesList } from "./direct-messages-list";
import { StartDMDialog } from "./start-dm-dialog";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useWorkspace } from "@/providers/workspace-provider";

interface WorkspaceSidebarProps {
  channels: (Channel & {
    members: (ChannelMember & {
      user: {
        id: string;
        name: string;
        email: string;
        imageUrl?: string | null;
        clerkId: string;
      };
    })[];
  })[];
  members: {
    user: {
      id: string;
      name: string;
      email: string;
      imageUrl?: string | null;
      clerkId: string;
    };
  }[];
}

export function WorkspaceSidebar({
  channels,
  members
}: WorkspaceSidebarProps) {
  const { workspace } = useWorkspace();

  if (!workspace) return null;

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold truncate">
            {workspace.name}
          </h2>
          <Link href={`/workspaces/${workspace.id}/settings`}>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <ChannelsList channels={channels} />
      <DirectMessagesList channels={channels} />
      <StartDMDialog members={members} />
    </div>
  );
} 