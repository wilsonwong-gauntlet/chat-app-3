"use client";

import * as React from "react";
import { Hash, Lock } from "lucide-react";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useModal } from "@/hooks/use-modal-store";
import { Channel, ChannelType, User } from "@/types";
import { AddChannelMemberForm } from "@/components/workspace/add-channel-member-form";
import { ChannelMemberOptions } from "@/components/workspace/channel-member-options";
import { useWorkspace } from "@/providers/workspace-provider";
import { toast } from "sonner";

interface ChannelDetailsData {
  channel: Channel & {
    members: {
      id: string;
      userId: string;
      user: {
        id: string;
        name: string;
        email: string;
        imageUrl: string | null;
        clerkId: string;
      };
    }[];
  };
}

export function ChannelDetailsModal() {
  const { isOpen, onClose, type, data } = useModal();
  const { workspace, refresh } = useWorkspace();
  const [isLoading, setIsLoading] = React.useState(false);

  const isModalOpen = isOpen && type === "channelDetails";
  const channel = data?.channel;

  React.useEffect(() => {
    if (!isModalOpen) {
      setIsLoading(false);
    }
  }, [isModalOpen]);

  if (!channel || !workspace) {
    return null;
  }

  // Transform workspace members to match the expected type
  const formattedMembers = workspace.members.map(member => ({
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      imageUrl: member.user.imageUrl || null,
      clerkId: member.user.clerkId,
    }
  }));

  const onAddMember = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/channels/${channel.id}/members`, {
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

      await refresh();
      toast.success("Member added successfully");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-zinc-900">
        <DialogHeader className="pt-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-x-2">
            {channel.type === ChannelType.PRIVATE ? (
              <Lock className="h-5 w-5" />
            ) : (
              <Hash className="h-5 w-5" />
            )}
            {channel.name}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="about">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <Separator />
          <ScrollArea className="flex-1 p-6">
            <TabsContent value="about" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold">Topic</h3>
                  <p className="text-sm text-muted-foreground">
                    {channel.description || "No topic set"}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold">Created by</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(channel.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="members" className="mt-0">
              <div className="space-y-4">
                <AddChannelMemberForm 
                  channelId={channel.id}
                  members={formattedMembers}
                  channelMembers={channel.members}
                  onAddMember={onAddMember}
                />
                <div className="space-y-4">
                  {channel.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-x-2">
                        <img
                          src={member.user.imageUrl || "/placeholder-avatar.png"}
                          alt={member.user.name}
                          className="h-8 w-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {member.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                      {channel.name !== "general" && (
                        <ChannelMemberOptions
                          channelId={channel.id}
                          memberId={member.userId}
                          isCurrentUser={false}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="settings" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Channel Type</h3>
                  <p className="text-sm text-muted-foreground">
                    {channel.type === ChannelType.PRIVATE
                      ? "Private - Only invited members can join"
                      : "Public - Anyone in the workspace can join"}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold">Channel ID</h3>
                  <p className="text-sm font-mono text-muted-foreground">
                    {channel.id}
                  </p>
                </div>
                <Separator />
                {channel.name !== "general" && (
                  <div>
                    <Button
                      variant="destructive"
                      onClick={handleClose}
                      className="w-full"
                      disabled={isLoading}
                    >
                      Leave Channel
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 