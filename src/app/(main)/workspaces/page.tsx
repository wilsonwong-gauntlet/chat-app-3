import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { EmptyWorkspaceClient } from "@/components/empty-workspace-client";

export default async function WorkspacesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has any workspaces
  const workspaces = await db.workspace.findMany({
    where: {
      members: {
        some: {
          userId: userId
        }
      }
    },
    take: 1
  });

  // If user has workspaces, redirect to the first one
  if (workspaces.length > 0) {
    redirect(`/workspaces/${workspaces[0].id}`);
  }

  // If no workspaces, show empty state
  return <EmptyWorkspaceClient />;
} 