"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useModal } from "@/hooks/use-modal-store";
import { Channel, ChannelType } from "@/types";

interface DirectMessagesListProps {
  channels: Channel[];
}

export function DirectMessagesList({ channels }: DirectMessagesListProps) {
  const params = useParams();
  const { onOpen } = useModal();

  const dmChannels = channels.filter(channel => channel.type === ChannelType.DIRECT);

  return (
    <div className="mt-2">
      <Separator className="my-2" />
      <div className="flex items-center justify-between py-2">
        <h2 className="text-sm font-semibold text-muted-foreground px-2">
          Direct Messages
        </h2>
        <Button
          onClick={() => onOpen("startDM")}
          size="icon"
          variant="ghost"
          className="h-4 w-4 mr-2"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ul className="space-y-[2px]">
        {dmChannels.map((channel) => (
          <li key={channel.id}>
            <Link
              href={`/workspaces/${params?.workspaceId}/channels/${channel.id}`}
              className={cn(
                "group relative flex items-center px-2 py-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 rounded-md mx-2 gap-x-2",
                params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
              )}
            >
              <span className="text-zinc-500 dark:text-zinc-400 transition group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                #
              </span>
              <span className="truncate text-sm text-zinc-500 dark:text-zinc-400 transition group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                {channel.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
} 