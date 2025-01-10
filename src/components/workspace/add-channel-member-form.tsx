"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useWorkspace } from "@/providers/workspace-provider";

interface AddChannelMemberFormProps {
  channelId: string;
}

export function AddChannelMemberForm({ channelId }: AddChannelMemberFormProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { workspace, refresh } = useWorkspace();

  const workspaceMembers = workspace?.members || [];

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
        >
          <span>Add members...</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search members..." />
          <CommandEmpty>No members found.</CommandEmpty>
          <CommandGroup>
            {workspaceMembers.map((member) => (
              <CommandItem
                key={member.id}
                value={member.user.name}
                onSelect={() => onSelect(member.userId)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    "opacity-0"
                  )}
                />
                <div className="flex items-center gap-x-2">
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
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 