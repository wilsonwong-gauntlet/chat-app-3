"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWorkspace } from "@/providers/workspace-provider";
import { useModal } from "@/hooks/use-modal-store";
import { Channel } from "@/types";

interface AddChannelMemberFormProps {
  channelId: string;
}

export function AddChannelMemberForm({ channelId }: AddChannelMemberFormProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { workspace, refresh } = useWorkspace();
  const { data } = useModal();
  const channel = (data as { channel: Channel })?.channel;

  // Filter out members who are already in the channel
  const availableMembers = workspace?.members?.filter(member => 
    !channel?.members?.some(channelMember => 
      channelMember.userId === member.user.id
    )
  ) || [];

  const onSelect = async (userId: string) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/channels/${channelId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add member");
      }

      // Refresh workspace data to update member list
      await refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={isLoading}
        >
          <span>Add members</span>
          <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Channel Members</DialogTitle>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Search members..." />
          <CommandEmpty>No members found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto p-2">
            {availableMembers.map((member) => (
              <CommandItem
                key={member.id}
                value={member.userId}
                onSelect={() => onSelect(member.userId)}
                className="flex items-center gap-x-2 px-2 py-1.5"
              >
                <img
                  src={member.user.imageUrl || "/placeholder-avatar.png"}
                  alt={member.user.name}
                  className="h-8 w-8 rounded-full"
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium">
                    {member.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </DialogContent>
    </Dialog>
  );
} 