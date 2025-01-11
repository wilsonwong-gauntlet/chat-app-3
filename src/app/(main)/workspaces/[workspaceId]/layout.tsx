import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { WorkspaceProvider } from "@/providers/workspace-provider";
import { WorkspaceSidebarClient } from "@/components/workspace/workspace-sidebar-client";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: { workspaceId: string }
}

export default async function WorkspaceLayout({
  children,
  params
}: WorkspaceLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get all workspaces for the user
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
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: {
        select: {
          members: true,
          channels: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <WorkspaceProvider>
      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:flex w-60 flex-col fixed inset-y-0 z-20 bg-zinc-50 dark:bg-zinc-900">
          <WorkspaceSidebarClient availableWorkspaces={workspaces} />
        </div>
        <main className="flex-1 h-full md:pl-60 overflow-hidden">
          {children}
        </main>
      </div>
    </WorkspaceProvider>
  );
} 