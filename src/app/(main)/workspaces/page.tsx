import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import EmptyWorkspaceClient from "@/components/empty-workspace-client";
import WorkspaceListClient from "@/components/workspace-list-client";

export default async function WorkspacesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get all workspaces the user is a member of
  const workspaces = await db.workspace.findMany({
    where: {
      members: {
        some: {
          user: {
            clerkId: userId
          }
        }
      }
    },
    include: {
      _count: {
        select: {
          members: true,
          channels: true
        }
      }
    }
  });

  // If no workspaces, show empty state
  if (workspaces.length === 0) {
    return <EmptyWorkspaceClient />;
  }

  // Show list of workspaces
  return <WorkspaceListClient workspaces={workspaces} />;
} 