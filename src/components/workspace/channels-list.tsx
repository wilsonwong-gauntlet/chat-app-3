"use client";

import { Lock, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { Channel, ChannelType, ChannelMember } from "@/types";
import { useWorkspace } from "@/providers/workspace-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChannelsListProps {
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

export function ChannelsList({ channels }: ChannelsListProps) {
  const params = useParams();
  const { onOpen } = useModal();
  const { workspace } = useWorkspace();
  const { user } = useUser();

  const regularChannels = channels.filter(
    channel => {
      // Filter out direct messages
      if (channel.type === ChannelType.DIRECT) return false;
      
      // For private channels, only show if user is a member
      if (channel.type === ChannelType.PRIVATE) {
        return channel.members.some(member => member.user.clerkId === user?.id);
      }
      
      // Show all public channels
      return true;
    }
  );

  const handleCreateChannel = () => {
    if (!workspace) return;
    onOpen("createChannel", { workspaceId: workspace.id });
  };

  const handleChannelSettings = (channel: Channel & {
    members: (ChannelMember & {
      user: {
        id: string;
        name: string;
        imageUrl: string | null;
        clerkId: string;
      };
    })[];
  }) => {
    onOpen("channelSettings", { channel });
  };

  return (
    <div>
      <div className="flex items-center justify-between py-2">
        <h2 className="text-sm font-semibold text-muted-foreground px-2">
          Channels
        </h2>
        <Button
          onClick={handleCreateChannel}
          size="icon"
          variant="ghost"
          className="h-4 w-4 mr-2"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ul className="space-y-[2px]">
        {regularChannels.map((channel) => (
          <li key={channel.id}>
            <div className="group relative flex items-center">
              <Link
                href={`/workspaces/${params?.workspaceId}/channels/${channel.id}`}
                className={cn(
                  "flex-1 flex items-center px-2 py-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 rounded-md mx-2 gap-x-2",
                  params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
                )}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center gap-x-2">
                        <span className="text-zinc-500 dark:text-zinc-400 transition group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                          {channel.type === ChannelType.PRIVATE ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            "#"
                          )}
                        </span>
                        <span className="truncate text-sm text-zinc-500 dark:text-zinc-400 transition group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                          {channel.name}
                        </span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {channel.type === ChannelType.PRIVATE ? (
                        <p>Private Channel - Only invited members can access</p>
                      ) : (
                        <p>Public Channel - Anyone in the workspace can join</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Link>
              <div className="absolute right-2 hidden group-hover:flex items-center gap-x-2">
                <Button
                  onClick={() => handleChannelSettings(channel)}
                  size="icon"
                  variant="ghost"
                  className="h-4 w-4"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 