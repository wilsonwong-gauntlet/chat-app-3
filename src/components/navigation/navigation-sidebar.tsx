"use client";

import { Plus } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";

import { WorkspaceItem } from "./workspace-item";
import { Button } from "@/components/ui/button";

interface NavigationSidebarProps {
  workspaces: {
    id: string;
    name: string;
  }[];
}

export const NavigationSidebar = ({
  workspaces
}: NavigationSidebarProps) => {
  const { onOpen } = useModal();

  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8] py-3">
      <Button
        onClick={() => onOpen("createWorkspace")}
        className="h-12 w-12"
        variant="outline"
      >
        <Plus className="h-6 w-6" />
      </Button>
      {workspaces.map((workspace) => (
        <WorkspaceItem
          key={workspace.id}
          id={workspace.id}
          name={workspace.name}
        />
      ))}
    </div>
  );
} 