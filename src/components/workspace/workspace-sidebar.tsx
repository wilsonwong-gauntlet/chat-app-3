"use client";

import { Hash, Plus, Settings, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useModal } from "@/hooks/use-modal-store";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { WorkspaceWithRelations, Channel } from "@/types";

interface WorkspaceSidebarProps {
  workspace: WorkspaceWithRelations;
}

export function WorkspaceSidebar({ workspace }: WorkspaceSidebarProps) {
  const { onOpen } = useModal();
  
  const channels = workspace.channels.filter(
    (channel: Channel) => channel.type !== "DIRECT"
  );

  const adminMember = workspace.members.find(m => m.role === "ADMIN");
  const otherMembers = workspace.members.filter(
    member => member.user.id !== adminMember?.user.id
  );

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{workspace.name}</h2>
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
      <ScrollArea className="flex-1 px-3">
        <div className="mb-2">
          <div className="flex items-center justify-between py-2">
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Channels
            </p>
            <Button
              onClick={() => onOpen("createChannel", { workspaceId: workspace.id })}
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-[2px]">
            {channels.map((channel: Channel) => (
              <Link
                key={channel.id}
                href={`/workspaces/${workspace.id}/channels/${channel.id}`}
                className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
              >
                <Hash className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <p className="line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition">
                  {channel.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
        <Separator className="my-2 bg-zinc-200 dark:bg-zinc-700" />
        <div>
          <div className="flex items-center justify-between py-2">
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Direct Messages
            </p>
          </div>
          <div className="space-y-[2px]">
            {otherMembers.map((member) => (
              <Button
                key={member.user.id}
                onClick={() => onOpen("createDM", { 
                  workspaceId: workspace.id,
                  userId: member.user.id 
                })}
                variant="ghost"
                className="w-full px-2 py-2 h-auto justify-start"
              >
                <div className="flex items-center gap-x-2">
                  <MessageSquare className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                  <span className="line-clamp-1 font-medium text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                    {member.user.name}
                  </span>
                </div>
              </Button>
            ))}
          </div>
          <MemberList workspace={workspace} />
        </div>
      </ScrollArea>
    </div>
  );
} 