import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";

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

export default async function WorkspaceLayout({
  children,
  params
}: {
  children: React.ReactNode;
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
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0 md:pl-[72px]">
        <WorkspaceSidebar workspaceId={params.workspaceId} />
      </div>
      <main className="h-full md:pl-60">
        {children}
      </main>
    </div>
  );
} 