"use client";

import { MoreVertical } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { MemberOptions } from "./member-options";
import { WorkspaceWithRelations } from "@/types";

interface MemberListProps {
  workspace: WorkspaceWithRelations | null | undefined;
}

export function MemberList({ workspace }: MemberListProps) {
  const { user } = useUser();

  // Get display name, handle empty/null cases
  const getDisplayName = (member: any) => {
    if (!member?.user) return "Anonymous User";
    return member.user.name || member.user.email?.split('@')[0] || "Anonymous User";
  };

  if (!workspace) {
    return null;
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-y-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Members</h3>
        </div>
        <div className="space-y-2">
          {workspace.members?.map((member) => (
            <div
              key={member.id}
              className="group flex items-center justify-between gap-x-2 rounded-md px-2 py-2 hover:bg-accent/50"
            >
              <div className="flex items-center gap-x-2">
                <UserAvatar
                  userId={member.user.id}
                  imageUrl={member.user.imageUrl}
                  name={getDisplayName(member)}
                />
                <div className="space-y-1">
                  <div className="text-sm font-medium leading-none">
                    {getDisplayName(member)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {member.role.toLowerCase()}
                  </p>
                </div>
              </div>
              <MemberOptions
                workspaceId={workspace.id}
                memberId={member.id}
                memberRole={member.role}
                isCurrentUser={member.user.id === user?.id}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
} 