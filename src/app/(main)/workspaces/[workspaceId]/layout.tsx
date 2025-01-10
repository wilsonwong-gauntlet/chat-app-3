import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { WorkspaceProvider } from "@/providers/workspace-provider";
import { WorkspaceSidebarServer } from "@/components/workspace/workspace-sidebar-server";
import { MemberRole, WorkspaceMember } from "@/types";

async function getWorkspace(workspaceId: string, userId: string) {
  // First get the database user
  const dbUser = await db.user.findUnique({
    where: { clerkId: userId }
  });

  if (!dbUser) {
    return null;
  }

  const workspace = await db.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              email: true,
              clerkId: true
            }
          }
        },
        orderBy: {
          role: "asc"
        }
      },
      channels: {
        where: {
          OR: [
            { type: "PUBLIC" },
            { type: "DIRECT" },
            {
              members: {
                some: {
                  userId: dbUser.id
                }
              }
            }
          ]
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  clerkId: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  if (!workspace) {
    return null;
  }

  // Check if user is a member
  const member = workspace.members.find((member: WorkspaceMember) => member.user.clerkId === userId);
  if (!member) {
    return null;
  }

  return {
    ...workspace,
    isAdmin: member.role === MemberRole.ADMIN
  };
}

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

  // Decode the workspace ID from the URL
  const decodedWorkspaceId = decodeURIComponent(params.workspaceId);
  const workspace = await getWorkspace(decodedWorkspaceId, userId);

  if (!workspace) {
    redirect("/workspaces");
  }

  return (
    <WorkspaceProvider initialWorkspace={workspace}>
      <div className="flex h-full">
        <div className="hidden md:flex w-60 z-20 flex-col fixed inset-y-0 left-[72px]">
          <WorkspaceSidebarServer workspaceId={decodedWorkspaceId} />
        </div>
        <main className="flex-1 h-full pl-[332px]">
          {children}
        </main>
      </div>
    </WorkspaceProvider>
  );
} 