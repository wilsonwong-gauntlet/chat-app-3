import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";

interface WorkspacesLayoutProps {
  children: React.ReactNode;
  params: { workspaceId: string };
}

export default async function WorkspacesLayout({
  children,
  params
}: WorkspacesLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // If we're at /workspaces root, check if user has any workspaces
  if (!params.workspaceId) {
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
  }

  return children;
} 