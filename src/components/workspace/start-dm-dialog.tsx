"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkspaceWithRelations } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StartDMDialogProps {
  workspace: WorkspaceWithRelations;
}

export function StartDMDialog({ workspace }: StartDMDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onMemberClick = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workspaces/${workspace.id}/direct-messages`, {
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
      router.push(`/workspaces/${workspace.id}/channels/${channel.id}`);
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
          variant="ghost"
          size="sm"
          className="group flex w-full items-center gap-x-2 rounded-md p-2 text-zinc-400 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span className="line-clamp-1 font-semibold text-sm">
            Start DM
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a Direct Message</DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-[300px]">
          <div className="space-y-2">
            {workspace.members.map((member) => (
              <Button
                key={member.user.id}
                variant="ghost"
                disabled={isLoading}
                onClick={() => onMemberClick(member.user.id)}
                className={cn(
                  "w-full flex items-center gap-x-2 justify-start",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.user.imageUrl || ""} />
                  <AvatarFallback>
                    {member.user.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="line-clamp-1 text-sm font-medium">
                  {member.user.name}
                </span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 