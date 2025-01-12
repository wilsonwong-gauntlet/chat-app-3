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
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  // Filter out current user and apply search
  const filteredMembers = members
    .filter(member => member.user.clerkId !== currentUser?.id)
    .filter(member => 
      member.user.name.toLowerCase().includes(search.toLowerCase()) ||
      member.user.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // Online users first
      const aOnline = onlineUsers[a.user.clerkId]?.presence === "ONLINE";
      const bOnline = onlineUsers[b.user.clerkId]?.presence === "ONLINE";
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;
      
      // Then alphabetically
      return a.user.name.localeCompare(b.user.name);
    });

  const startDM = async (member: { user: User }) => {
    try {
      setIsLoading(true);
      setLoadingUserId(member.user.id);

      const response = await fetch(`/api/workspaces/${params.workspaceId}/direct-messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: member.user.clerkId }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create conversation");
      }

      const channel = await response.json();
      router.push(`/workspaces/${params.workspaceId}/channels/${channel.id}`);
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start conversation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingUserId(null);
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
              const presence = onlineUsers[member.user.clerkId]?.presence || "OFFLINE";
              const isLoading = loadingUserId === member.user.id;
              
              return (
                <Button
                  key={member.user.id}
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center gap-x-2 px-2 py-1.5 h-auto",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={isLoading}
                  onClick={() => startDM(member)}
                >
                  <div className="relative">
                    <UserAvatar
                      userId={member.user.id}
                      imageUrl={member.user.imageUrl}
                      name={member.user.name}
                      className="h-8 w-8"
                    />
                    <div className={cn(
                      "absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white dark:border-zinc-900",
                      presence === "ONLINE" && "bg-emerald-500",
                      presence === "AWAY" && "bg-yellow-500",
                      presence === "DND" && "bg-rose-500",
                      presence === "OFFLINE" && "bg-zinc-500"
                    )} />
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm font-semibold truncate w-full">
                      {member.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {member.user.email}
                    </span>
                  </div>
                  {presence === "ONLINE" && (
                    <span className="text-xs text-emerald-500 font-medium">
                      online
                    </span>
                  )}
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