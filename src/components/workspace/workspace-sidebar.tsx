"use client";

import { Channel } from "@/types";
import { ChannelsList } from "./channels-list";
import { DirectMessagesList } from "./direct-messages-list";
import { StartDMDialog } from "./start-dm-dialog";

interface WorkspaceSidebarProps {
  channels: Channel[];
  members: {
    user: {
      id: string;
      name: string;
      email: string;
      imageUrl?: string | null;
    };
  }[];
}

export function WorkspaceSidebar({
  channels,
  members
}: WorkspaceSidebarProps) {
  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ChannelsList channels={channels} />
      <DirectMessagesList channels={channels} />
      <StartDMDialog members={members} />
    </div>
  );
} 