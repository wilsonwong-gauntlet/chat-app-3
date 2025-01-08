import { redirect } from "next/navigation";
import { Hash, Mic, Video } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ServerHeader } from "./server-header";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";
import { Channel, Workspace } from "@/types";

interface ServerSidebarProps {
  workspaceId: string;
}

export default async function ServerSidebar({
  workspaceId
}: ServerSidebarProps) {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  const workspace = await db.workspace.findUnique({
    where: {
      id: workspaceId,
    }
  });

  if (!workspace) {
    return redirect("/");
  }

  const channels = await db.channel.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const role = await db.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: profile.id,
    }
  });

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerHeader
            workspace={workspace}
            role={role?.role}
          />
          <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
        </div>
        {!!channels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType="TEXT"
              role={role?.role}
              label="Text Channels"
            />
            <div className="space-y-[2px]">
              {channels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role?.role}
                  workspace={workspace}
                />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 