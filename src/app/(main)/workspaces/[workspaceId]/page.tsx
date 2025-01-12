import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Hash, Lock, Users, Plus } from "lucide-react";

import { getWorkspace } from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import { Channel, ChannelType } from "@/types";
import { cn } from "@/lib/utils";

export default async function WorkspacePage({
  params
}: {
  params: { workspaceId: string }
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const workspace = await getWorkspace(params.workspaceId, userId);

  if (!workspace) {
    redirect("/workspaces");
  }

  // Separate channels by type
  const publicChannels = workspace.channels.filter(
    (channel) => channel.type === ChannelType.PUBLIC
  );
  const privateChannels = workspace.channels.filter(
    (channel) => channel.type === ChannelType.PRIVATE
  );

  return (
    <div className="h-full p-8 space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome to {workspace.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          Select a channel from the sidebar or browse available channels below
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="font-medium mb-1">Members</h3>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-semibold">{workspace.members.length}</span>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="font-medium mb-1">Public Channels</h3>
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-semibold">{publicChannels.length}</span>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <h3 className="font-medium mb-1">Private Channels</h3>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-semibold">{privateChannels.length}</span>
          </div>
        </div>
      </div>

      {/* Available Channels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Available Channels</h2>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Channel
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {publicChannels.map((channel) => (
            <a
              key={channel.id}
              href={`/workspaces/${workspace.id}/channels/${channel.id}`}
              className={cn(
                "group p-4 rounded-lg border bg-card",
                "hover:border-primary/50 transition-colors"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">{channel.name}</h3>
              </div>
              {channel.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {channel.description}
                </p>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                {channel.members.length} members
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
} 