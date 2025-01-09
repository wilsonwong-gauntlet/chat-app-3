"use client";

import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CreateDMModal() {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isModalOpen = isOpen && type === "createDM";
  const { workspaceId, userId } = data;

  const onCreateDM = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/direct-messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create DM");
      }

      const channel = await response.json();
      router.push(`/workspaces/${workspaceId}/channels/${channel.id}`);
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-create DM when modal opens
  if (isModalOpen && !isLoading && workspaceId && userId) {
    onCreateDM();
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-zinc-900 text-black dark:text-white">
        <DialogHeader>
          <DialogTitle>Creating Direct Message...</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
} 