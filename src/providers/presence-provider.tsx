"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

import { pusherClient } from "@/lib/pusher";
import { User, PresenceStatus } from "@/types";

interface PresenceContextType {
  onlineUsers: { [clerkId: string]: User & { presence: PresenceStatus; status?: string } };
  setUserPresence: (presence: PresenceStatus) => Promise<void>;
  setUserStatus: (status: string) => Promise<void>;
}

const PresenceContext = createContext<PresenceContextType>({
  onlineUsers: {},
  setUserPresence: async () => {},
  setUserStatus: async () => {},
});

export const usePresence = () => {
  return useContext(PresenceContext);
};

interface PresenceProviderProps {
  children: React.ReactNode;
}

export function PresenceProvider({ children }: PresenceProviderProps) {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  const [onlineUsers, setOnlineUsers] = useState<{
    [key: string]: User & { presence: PresenceStatus; status?: string };
  }>({});

  const setUserPresence = useCallback(async (presence: PresenceStatus) => {
    if (!user || !workspaceId) return;

    try {
      await fetch("/api/presence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ presence, workspaceId }),
      });
    } catch (error) {
      console.error("[PRESENCE_UPDATE]", error);
    }
  }, [user, workspaceId]);

  const setUserStatus = useCallback(async (status: string) => {
    if (!user || !workspaceId) return;

    try {
      await fetch("/api/presence/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, workspaceId }),
      });
    } catch (error) {
      console.error("[STATUS_UPDATE]", error);
    }
  }, [user, workspaceId]);

  useEffect(() => {
    if (!isLoaded || !workspaceId || !user) return;

    // Subscribe to presence channel
    const channel = pusherClient.subscribe(`presence-workspace-${workspaceId}`);

    // Handle initial presence state
    channel.bind("pusher:subscription_succeeded", (members: any) => {
      const initialUsers: typeof onlineUsers = {};
      members.each((member: any) => {
        initialUsers[member.info.clerkId] = {
          ...member.info,
          presence: member.info.presence || PresenceStatus.ONLINE,
        };
      });
      setOnlineUsers(initialUsers);
    });

    // Handle member added
    channel.bind("pusher:member_added", (member: any) => {
      setOnlineUsers((current) => ({
        ...current,
        [member.info.clerkId]: {
          ...member.info,
          presence: member.info.presence || PresenceStatus.ONLINE,
        },
      }));
    });

    // Handle member removed
    channel.bind("pusher:member_removed", (member: any) => {
      setOnlineUsers((current) => {
        const updated = { ...current };
        delete updated[member.info.clerkId];
        return updated;
      });
    });

    // Handle presence updates
    channel.bind("presence:update", ({ clerkId, presence, status }: any) => {
      setOnlineUsers((current) => ({
        ...current,
        [clerkId]: {
          ...current[clerkId],
          presence: presence || current[clerkId]?.presence,
          status: status ?? current[clerkId]?.status,
        },
      }));
    });

    // Set initial presence
    setUserPresence(PresenceStatus.ONLINE);

    // Handle window visibility changes
    const handleVisibilityChange = () => {
      setUserPresence(document.hidden ? PresenceStatus.AWAY : PresenceStatus.ONLINE);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      channel.unbind_all();
      pusherClient.unsubscribe(`presence-workspace-${workspaceId}`);
      setUserPresence(PresenceStatus.OFFLINE);
    };
  }, [workspaceId, user, setUserPresence, isLoaded]);

  return (
    <PresenceContext.Provider
      value={{
        onlineUsers,
        setUserPresence,
        setUserStatus,
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
} 