"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface StartDMDialogProps {
  members: {
    user: User;
  }[];
}

export function StartDMDialog({ members }: StartDMDialogProps) {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useUser();
  const { isOpen, onClose, type } = useModal();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isModalOpen = isOpen && type === "startDM";

  // Filter out the current user from the members list
  const availableMembers = members.filter(
    member => member.user.clerkId !== currentUser?.id
  );

  const onStartDM = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      
      // First check if a DM channel already exists
      const response = await fetch(`/api/workspaces/${params.workspaceId}/direct-messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: selectedUser.clerkId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to check existing DMs");
      }
      
      const channel = await response.json();
      router.push(`/workspaces/${params.workspaceId}/channels/${channel.id}`);
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Failed to start DM:", error);
      // Here you might want to show a toast notification to the user
    } finally {
      setIsLoading(false);
    }
  };

  const onMemberClick = (member: { user: User }) => {
    setSelectedUser(selectedUser?.id === member.user.id ? null : member.user);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start Direct Message</DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-[300px]">
          <div className="space-y-4">
            {availableMembers.map((member) => (
              <div
                key={member.user.id}
                onClick={() => onMemberClick(member)}
                className={cn(
                  "flex items-center gap-x-2 p-2 rounded-lg hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 cursor-pointer",
                  selectedUser?.id === member.user.id && "bg-zinc-700/20 dark:bg-zinc-700"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.user.imageUrl || ""} />
                  <AvatarFallback>
                    {member.user.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
                {selectedUser?.id === member.user.id && (
                  <Check className="h-4 w-4 text-primary ml-auto" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end mt-4">
          <button
            onClick={onStartDM}
            disabled={!selectedUser || isLoading}
            className={cn(
              "flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2",
              !selectedUser || isLoading
                ? "bg-zinc-500 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Start conversation"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 