import { db } from "@/lib/db";
import { Workspace, Channel, User } from "@prisma/client";

type WorkspaceWithRelations = Workspace & {
  members: {
    user: User;
  }[];
  channels: (Channel & {
    members: {
      user: User;
    }[];
  })[];
};

export async function getWorkspace(workspaceId: string, userId: string): Promise<WorkspaceWithRelations | null> {
  const workspace = await db.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    include: {
      members: {
        include: {
          user: true
        }
      },
      channels: {
        include: {
          members: {
            include: {
              user: true
            }
          }
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