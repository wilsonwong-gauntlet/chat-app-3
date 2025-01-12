"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Search } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@/types";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { usePresence } from "@/providers/presence-provider";
import { Input } from "@/components/ui/input";

interface MemberListPopoverProps {
  members: {
    user: User;
  }[];
  trigger: React.ReactNode;
}

export function MemberListPopover({ members, trigger }: MemberListPopoverProps) {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useUser();
  const { onlineUsers } = usePresence();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filter out current user and apply search
  const filteredMembers = members
    .filter(member => member.user.clerkId !== currentUser?.id)
    .filter(member => 
      member.user.name.toLowerCase().includes(search.toLowerCase()) ||
      member.user.email.toLowerCase().includes(search.toLowerCase())
    );

  const startDM = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workspaces/${params.workspaceId}/direct-messages`, {
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
      router.push(`/workspaces/${params.workspaceId}/channels/${channel.id}`);
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        side="right" 
        align="start"
      >
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="max-h-80">
          <div className="p-2 space-y-1">
            {filteredMembers.map((member) => {
              const isOnline = onlineUsers[member.user.clerkId]?.presence === "ONLINE";
              
              return (
                <Button
                  key={member.user.id}
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center gap-x-2 px-2 py-1.5 h-auto",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={isLoading}
                  onClick={() => startDM(member.user.id)}
                >
                  <div className="relative">
                    <UserAvatar
                      userId={member.user.id}
                      imageUrl={member.user.imageUrl}
                      name={member.user.name}
                      className="h-8 w-8"
                    />
                    <div className={cn(
                      "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white",
                      isOnline ? "bg-emerald-500" : "bg-zinc-500"
                    )} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">
                      {member.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {member.user.email}
                    </span>
                  </div>
                </Button>
              );
            })}
            {filteredMembers.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No members found
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 