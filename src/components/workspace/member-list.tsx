"use client";

import { WorkspaceMember } from "@prisma/client";

import { useWorkspace } from "@/providers/workspace-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MemberWithUser extends WorkspaceMember {
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl: string | null;
  }
}

export function MemberList() {
  const { workspace } = useWorkspace();

  if (!workspace?.members) return null;

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {workspace.members.map((member: MemberWithUser) => (
          <div key={member.id} className="flex items-center gap-x-2 px-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={member.user.imageUrl || undefined} />
              <AvatarFallback>
                {member.user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {member.user.name}
              </span>
              <span className="text-xs text-zinc-400">
                {member.role.toLowerCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 