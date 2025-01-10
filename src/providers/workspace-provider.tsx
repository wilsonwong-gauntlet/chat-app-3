"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Channel, ChannelType, ChannelMember, Workspace, WorkspaceWithRelations } from "@/types";
import { pusherClient } from "@/lib/pusher";

interface WorkspaceProviderProps {
  children: React.ReactNode;
}

interface WorkspaceContextType {
  workspace: WorkspaceWithRelations | null;
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
  })[] | null;
  members: {
    user: {
      id: string;
      name: string;
      email: string;
      imageUrl: string | null;
      clerkId: string;
    };
  }[] | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const WorkspaceContext = React.createContext<WorkspaceContextType>({
  workspace: null,
  channels: null,
  members: null,
  isLoading: true,
  refresh: async () => {},
});

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const params = useParams();
  const { userId } = useAuth();
  const workspaceId = params.workspaceId as string;

  const [workspace, setWorkspace] = React.useState<WorkspaceWithRelations | null>(null);
  const [channels, setChannels] = React.useState<WorkspaceContextType["channels"]>(null);
  const [members, setMembers] = React.useState<WorkspaceContextType["members"]>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      if (!workspaceId || !userId) return;

      const response = await fetch(`/api/workspaces/${workspaceId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch workspace");
      }

      // Filter out any private channels where the user is not a member
      const filteredChannels = data.channels.filter((channel: Channel & { members: ChannelMember[] }) => {
        if (channel.type === ChannelType.PRIVATE) {
          return channel.members.some((member) => 
            member.user.clerkId === userId
          );
        }
        return true;
      });

      // The API returns the workspace object directly with members and channels
      setWorkspace(data);
      setChannels(filteredChannels);
      setMembers(data.members);
    } catch (error) {
      console.error("Error fetching workspace:", error);
      // On error, reset the state
      setWorkspace(null);
      setChannels(null);
      setMembers(null);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, userId]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (!workspaceId) return;

    const channel = pusherClient.subscribe(workspaceId);

    // Channel events
    channel.bind("channel:update", refresh);
    channel.bind("channel:delete", refresh);
    channel.bind("channel:member_add", refresh);
    channel.bind("channel:member_remove", refresh);
    channel.bind("channel:create", (newChannel: Channel & {
      members: (ChannelMember & {
        user: {
          id: string;
          name: string;
          email: string;
          imageUrl: string | null;
          clerkId: string;
        };
      })[];
    }) => {
      if (newChannel.type === ChannelType.PRIVATE) {
        const isUserMember = newChannel.members.some(
          (member) => member.user.clerkId === userId
        );
        if (!isUserMember) return;
      }
      setChannels((prev) => prev ? [...prev, newChannel] : [newChannel]);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(workspaceId);
    };
  }, [workspaceId, refresh]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        channels,
        members,
        isLoading,
        refresh,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = React.useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
} 