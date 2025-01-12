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
import { User } from "@/types";

interface PresenceContextType {
  onlineUsers: { [key: string]: User & { presence: string; status?: string } };
  setUserPresence: (presence: string) => Promise<void>;
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
  const { user } = useUser();
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  const [onlineUsers, setOnlineUsers] = useState<{
    [key: string]: User & { presence: string; status?: string };
  }>({});

  const setUserPresence = useCallback(async (presence: string) => {
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
      console.error("Failed to update presence:", error);
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
      console.error("Failed to update status:", error);
    }
  }, [user, workspaceId]);

  useEffect(() => {
    if (!workspaceId || !user) return;

    // Subscribe to presence channel
    const channel = pusherClient.subscribe(`presence-workspace-${workspaceId}`);

    // Handle initial presence state
    channel.bind("pusher:subscription_succeeded", (members: any) => {
      const initialUsers: typeof onlineUsers = {};
      members.each((member: any) => {
        initialUsers[member.id] = member.info;
      });
      setOnlineUsers(initialUsers);
    });

    // Handle member added
    channel.bind("pusher:member_added", (member: any) => {
      setOnlineUsers((current) => ({
        ...current,
        [member.id]: member.info,
      }));
    });

    // Handle member removed
    channel.bind("pusher:member_removed", (member: any) => {
      setOnlineUsers((current) => {
        const updated = { ...current };
        delete updated[member.id];
        return updated;
      });
    });

    // Handle status updates
    channel.bind("presence:update", ({ userId, presence, status }: any) => {
      setOnlineUsers((current) => ({
        ...current,
        [userId]: {
          ...current[userId],
          presence,
          status,
        },
      }));
    });

    // Set initial presence
    setUserPresence("ONLINE");

    // Handle window visibility changes
    const handleVisibilityChange = () => {
      setUserPresence(document.hidden ? "AWAY" : "ONLINE");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      channel.unbind_all();
      pusherClient.unsubscribe(`presence-workspace-${workspaceId}`);
      setUserPresence("OFFLINE");
    };
  }, [workspaceId, user, setUserPresence]);

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