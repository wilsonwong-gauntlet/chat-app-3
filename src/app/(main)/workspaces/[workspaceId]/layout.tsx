import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { WorkspaceProvider } from "@/providers/workspace-provider";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";

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
                  imageUrl: true
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
  const member = workspace.members.find(member => member.userId === dbUser.id);
  if (!member) {
    return null;
  }

  return {
    ...workspace,
    isAdmin: member.role === "ADMIN"
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

  const workspace = await getWorkspace(params.workspaceId, userId);

  if (!workspace) {
    redirect("/workspaces");
  }

  return (
    <WorkspaceProvider initialWorkspace={workspace}>
      <div className="h-full">
        <div className="hidden md:flex h-full w-60 z-30 flex-col fixed inset-y-0 md:pl-[72px]">
          <WorkspaceSidebar />
        </div>
        <main className="h-full md:pl-[calc(72px+240px)]">
          {children}
        </main>
      </div>
    </WorkspaceProvider>
  );
} 