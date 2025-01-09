"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { WorkspaceWithRelations } from "@/types";

interface WorkspaceContextType {
  workspace: WorkspaceWithRelations | null;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspace: null,
  isLoading: false,
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

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        if (!params?.workspaceId) {
          return;
        }

        setIsLoading(true);
        const response = await fetch(`/api/workspaces/${params.workspaceId}`);
        
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
    };

    // Only fetch if the workspaceId changes and doesn't match the current workspace
    if (params?.workspaceId && params.workspaceId !== workspace.id) {
      fetchWorkspace();
    }
  }, [params?.workspaceId, workspace.id]);

  return (
    <WorkspaceContext.Provider value={{ workspace, isLoading }}>
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