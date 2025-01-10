import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { User } from "@/types";

interface WorkspaceSidebarServerProps {
  workspaceId: string;
}

interface WorkspaceMember {
  user: User;
}

export async function WorkspaceSidebarServer({
  workspaceId,
}: WorkspaceSidebarServerProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const workspace = await db.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    include: {
      channels: {
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      },
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!workspace) {
    redirect("/");
  }

  const member = workspace.members.find(
    (member: WorkspaceMember) => member.user.clerkId === userId
  );

  if (!member) {
    redirect("/");
  }

  return (
    <WorkspaceSidebar
      channels={workspace.channels}
      members={workspace.members}
    />
  );
} 