"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

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
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      imageUrl: string | null;
    };
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
  const availableMembers = React.useMemo(() => {
    const filtered = members.filter(member => 
      !channelMembers.some(channelMember => 
        channelMember.userId === member.user.id
      )
    );

    return filtered.filter(member =>
      member.user.name.toLowerCase().includes(search.toLowerCase()) ||
      member.user.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, channelMembers, search]);

  const onSelect = async (member: typeof members[0]) => {
    try {
      setIsLoading(true);
      await onAddMember(member.user.id);
      toast.success("Member added to channel");
      setOpen(false);
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member to channel");
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
        <div className="space-y-4">
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
          <ScrollArea className="h-[300px] overflow-auto rounded-md border">
            <div className="p-2 space-y-2">
              {availableMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">No members found.</p>
              ) : (
                availableMembers.map((member) => (
                  <button
                    key={member.user.id}
                    onClick={() => onSelect(member)}
                    disabled={isLoading}
                    className="flex items-center gap-x-2 w-full p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <img
                      src={member.user.imageUrl || "/placeholder-avatar.png"}
                      alt={member.user.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="flex flex-col items-start">
                      <p className="text-sm font-medium">
                        {member.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
} 