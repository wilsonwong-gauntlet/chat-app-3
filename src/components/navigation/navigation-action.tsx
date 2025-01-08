"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

export function NavigationAction() {
  const { onOpen } = useModal();

  return (
    <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
      <Button
        size="icon"
        variant="outline"
        className="h-[48px] w-[48px]"
        onClick={() => onOpen("createWorkspace")}
      >
        <Plus className="h-[25px] w-[25px]" />
      </Button>
    </div>
  );
} 