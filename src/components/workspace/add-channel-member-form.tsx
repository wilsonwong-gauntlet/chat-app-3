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
import { Channel, ChannelMember, User } from "@/types";
import { useModal } from "@/hooks/use-modal-store";

interface AddChannelMemberFormProps {
  channelId: string;
  members: {
    user: {
      id: string;
      name: string;
      email: string;
      imageUrl: string | null;
      clerkId: string;
    };
  }[];
  channelMembers: {
    userId: string;
  }[];
  onAddMember: (userId: string) => Promise<void>;
}

export function AddChannelMemberForm({ 
  channelId, 
  members,
  channelMembers,
  onAddMember 
}: AddChannelMemberFormProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Filter out members who are already in the channel
  const availableMembers = members.filter(member => 
    !channelMembers.some(channelMember => 
      channelMember.userId === member.user.id
    )
  ).filter(member =>
    member.user.name.toLowerCase().includes(search.toLowerCase()) ||
    member.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const onSelect = async (userId: string) => {
    try {
      setIsLoading(true);
      await onAddMember(userId);
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
          <CommandInput 
            placeholder="Search members..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>No members found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto p-2">
            {availableMembers.map((member) => (
              <CommandItem
                key={member.user.id}
                value={member.user.id}
                onSelect={() => onSelect(member.user.id)}
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