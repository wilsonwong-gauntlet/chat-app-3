"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModal } from "@/hooks/use-modal-store";

interface WorkspaceSwitcherProps {
  currentWorkspaceId: string;
  workspaces: {
    id: string;
    name: string;
  }[];
}

export function WorkspaceSwitcher({
  currentWorkspaceId,
  workspaces
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const { onOpen } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const onWorkspaceChange = (workspaceId: string) => {
    if (workspaceId === "new") {
      // Open the create workspace modal instead of navigating
      onOpen("createWorkspace");
    } else {
      router.push(`/workspaces/${workspaceId}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Switch Workspace</label>
        <Select
          value={currentWorkspaceId}
          onValueChange={onWorkspaceChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a workspace" />
          </SelectTrigger>
          <SelectContent>
            {workspaces.map((workspace) => (
              <SelectItem key={workspace.id} value={workspace.id}>
                {workspace.name}
              </SelectItem>
            ))}
            <SelectItem value="new" className="text-emerald-600">
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Workspace
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 