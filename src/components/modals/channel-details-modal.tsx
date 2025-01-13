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
import { Channel, ChannelType } from "@/types";
import { AddChannelMemberForm } from "@/components/workspace/add-channel-member-form";
import { ChannelMemberOptions } from "@/components/workspace/channel-member-options";

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
      };
    }[];
  };
}

export function ChannelDetailsModal() {
  const { isOpen, onClose, type, data } = useModal();
  const [activeTab, setActiveTab] = React.useState("about");

  const isModalOpen = isOpen && type === "channelDetails";
  const { channel } = data as ChannelDetailsData;

  if (!channel) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6">
          <div className="flex items-center gap-x-2">
            {channel.type === ChannelType.PRIVATE ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Hash className="h-4 w-4" />
            )}
            <DialogTitle className="text-2xl font-bold">
              {channel.name}
            </DialogTitle>
          </div>
        </DialogHeader>
        <Tabs
          defaultValue="about"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1"
        >
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="members">
                Members ({channel.members.length})
              </TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>
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
                <AddChannelMemberForm channelId={channel.id} />
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
                      onClick={() => onClose()}
                      className="w-full"
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