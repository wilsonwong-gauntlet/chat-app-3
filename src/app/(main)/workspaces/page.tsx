"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

export default function WorkspacesPage() {
  const { onOpen } = useModal();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="max-w-md text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Welcome to Slack Clone</h2>
        <p className="text-slate-500 mb-8">Get started by creating or joining a workspace</p>
        <Button
          size="lg"
          onClick={() => onOpen("createWorkspace")}
        >
          Create a Workspace
        </Button>
      </div>
    </div>
  );
} 