import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

async function getWorkspace(workspaceId: string, userId: string) {
  const workspace = await db.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  });

  if (!workspace) {
    return null;
  }

  // Check if user is a member
  const member = workspace.members.find(member => member.user.clerkId === userId);
  if (!member) {
    return null;
  }

  return workspace;
}

export default async function WorkspacePage({
  params
}: {
  params: { workspaceId: string }
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const workspace = await getWorkspace(params.workspaceId, userId);

  if (!workspace) {
    redirect("/workspaces");
  }

  return (
    <div className="h-full p-4">
      <h1 className="text-2xl font-bold mb-4">
        Welcome to {workspace.name}
      </h1>
      <p className="text-muted-foreground">
        Select a channel to start chatting
      </p>
    </div>
  );
} 