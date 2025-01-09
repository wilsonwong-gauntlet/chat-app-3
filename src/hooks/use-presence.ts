import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { create } from "zustand";
import { pusherClient } from "@/lib/pusher";

export const USER_STATUS = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  AWAY: "AWAY",
  DO_NOT_DISTURB: "DO_NOT_DISTURB"
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

interface UserPresence {
  userId: string;
  status: UserStatus;
  statusMessage?: string;
  lastSeen?: Date;
}

interface PresenceStore {
  userPresence: Record<string, UserPresence>;
  setUserPresence: (userId: string, presence: Omit<UserPresence, "userId">) => void;
  removeUserPresence: (userId: string) => void;
}

export const usePresenceStore = create<PresenceStore>((set) => ({
  userPresence: {},
  setUserPresence: (userId, presence) =>
    set((state) => ({
      userPresence: {
        ...state.userPresence,
        [userId]: {
          ...presence,
          userId
        },
      },
    })),
  removeUserPresence: (userId) =>
    set((state) => {
      const { [userId]: _, ...rest } = state.userPresence;
      return { userPresence: rest };
    }),
}));

export function usePresence(workspaceId?: string) {
  const { user } = useUser();
  const [presence, setPresence] = useState<Omit<UserPresence, "userId">>({
    status: USER_STATUS.OFFLINE
  });
  const setUserPresence = usePresenceStore((state) => state.setUserPresence);

  // Update presence when user becomes active/inactive
  useEffect(() => {
    if (!user?.id) return;

    let inactivityTimeout: NodeJS.Timeout;

    const updatePresence = async (status: UserStatus, statusMessage?: string) => {
      try {
        const response = await axios.patch("/api/users/status", {
          status,
          statusMessage
        });
        setPresence(response.data);
      } catch (error) {
        console.error("Failed to update presence:", error);
      }
    };

    const handleActivity = () => {
      clearTimeout(inactivityTimeout);
      updatePresence(USER_STATUS.ONLINE);
      
      // Set timeout for inactivity
      inactivityTimeout = setTimeout(() => {
        updatePresence(USER_STATUS.AWAY);
      }, 5 * 60 * 1000); // 5 minutes
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(inactivityTimeout);
        updatePresence(USER_STATUS.OFFLINE);
      } else {
        handleActivity();
      }
    };

    // Set up event listeners
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial presence update
    handleActivity();

    // Clean up
    return () => {
      clearTimeout(inactivityTimeout);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      updatePresence(USER_STATUS.OFFLINE);
    };
  }, [user?.id]);

  // Subscribe to presence updates for the workspace
  useEffect(() => {
    if (!workspaceId) return;

    const channel = pusherClient.subscribe(`presence-workspace-${workspaceId}`);

    channel.bind("presence-update", (data: UserPresence) => {
      setUserPresence(data.userId, {
        status: data.status,
        statusMessage: data.statusMessage,
        lastSeen: data.lastSeen
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [workspaceId, setUserPresence]);

  const updateStatus = async (status: UserStatus, statusMessage?: string) => {
    try {
      const response = await axios.patch("/api/users/status", {
        status,
        statusMessage
      });
      setPresence(response.data);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return {
    presence,
    updateStatus
  };
} 