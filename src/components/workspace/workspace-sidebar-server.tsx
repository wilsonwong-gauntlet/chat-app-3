import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { WorkspaceSidebar } from "./workspace-sidebar";

interface WorkspaceSidebarServerProps {
  workspaceId: string;
}

export async function WorkspaceSidebarServer({ workspaceId }: WorkspaceSidebarServerProps) {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const workspace = await db.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    include: {
      channels: {
        where: {
          members: {
            some: {
              userId: profile.id
            }
          }
        },
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      },
      members: {
        include: {
          user: true
        }
      }
    }
  });

  if (!workspace) {
    return redirect("/");
  }

  return <WorkspaceSidebar workspace={workspace} />;
} 