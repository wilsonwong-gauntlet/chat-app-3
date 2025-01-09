"use client";

import { useParams } from "next/navigation";
import { Plus, Settings } from "lucide-react";

import { useWorkspace } from "@/providers/workspace-provider";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChannelList } from "@/components/workspace/channel-list";
import { MemberList } from "@/components/workspace/member-list";

export function WorkspaceSidebar() {
  const { workspace } = useWorkspace();
  const { onOpen } = useModal();
  const params = useParams();

  if (!workspace) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-800 text-primary-foreground">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{workspace.name}</h2>
          <Button
            onClick={() => onOpen("workspaceSettings")}
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-zinc-400 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="mb-4">
          <div className="flex items-center justify-between py-2">
            <h3 className="text-sm font-semibold text-zinc-400">Channels</h3>
            <Button
              onClick={() => onOpen("createChannel")}
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-zinc-400 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ChannelList />
        </div>
        <Separator className="bg-zinc-700 my-2" />
        <div className="mb-4">
          <div className="flex items-center justify-between py-2">
            <h3 className="text-sm font-semibold text-zinc-400">Members</h3>
            <Button
              onClick={() => onOpen("inviteMembers")}
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-zinc-400 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <MemberList />
        </div>
      </ScrollArea>
    </div>
  );
} 