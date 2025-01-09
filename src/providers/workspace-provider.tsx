"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

import { WorkspaceWithRelations } from "@/types";

interface WorkspaceContextType {
  workspace: WorkspaceWithRelations | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspace: null,
  isLoading: false,
  refresh: async () => {},
});

interface WorkspaceProviderProps {
  children: React.ReactNode;
  initialWorkspace: WorkspaceWithRelations;
}

export function WorkspaceProvider({
  children,
  initialWorkspace
}: WorkspaceProviderProps) {
  const params = useParams();
  const [workspace, setWorkspace] = useState<WorkspaceWithRelations>(initialWorkspace);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchWorkspace = useCallback(async () => {
    try {
      if (!params?.workspaceId) {
        return;
      }

      setIsLoading(true);
      
      const timestamp = Date.now();
      const response = await fetch(`/api/workspaces/${params.workspaceId}?_=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch workspace");
      }

      const data = await response.json();
      setWorkspace(data);
    } catch (error) {
      console.error("Error fetching workspace:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params?.workspaceId]);

  const refresh = useCallback(async () => {
    setRefreshKey(k => k + 1);
    await fetchWorkspace();
  }, [fetchWorkspace]);

  // Fetch when workspaceId or refreshKey changes
  useEffect(() => {
    if (params?.workspaceId) {
      fetchWorkspace();
    }
  }, [params?.workspaceId, refreshKey, fetchWorkspace]);

  return (
    <WorkspaceContext.Provider value={{ workspace, isLoading, refresh }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}; 