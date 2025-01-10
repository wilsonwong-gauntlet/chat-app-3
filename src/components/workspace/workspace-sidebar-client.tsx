"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Channel, ChannelMember, WorkspaceWithRelations } from "@/types";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { useWorkspace } from "@/providers/workspace-provider";

export function WorkspaceSidebarClient() {
  const params = useParams();
  const { workspace, isLoading } = useWorkspace();
  const [channels, setChannels] = useState<WorkspaceWithRelations['channels']>([]);
  const [members, setMembers] = useState<WorkspaceWithRelations['members']>([]);

  useEffect(() => {
    if (workspace) {
      setChannels(workspace.channels);
      setMembers(workspace.members);
    }
  }, [workspace]);

  if (!workspace || isLoading) {
    return (
      <div className="flex flex-col h-full w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
        <div className="p-3">
          <div className="w-32 h-6 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded-md" />
        </div>
        <div className="space-y-2 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-full h-8 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded-md mx-2" />
          ))}
        </div>
      </div>
    );
  }

  return <WorkspaceSidebar channels={channels} members={members} />;
} 