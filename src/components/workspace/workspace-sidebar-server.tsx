import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { User, WorkspaceMember as WorkspaceMemberType, Channel, ChannelType } from "@/types";

// Disable caching for this component
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface WorkspaceSidebarServerProps {
  workspaceId: string;
}

export async function WorkspaceSidebarServer({
  workspaceId,
}: WorkspaceSidebarServerProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const workspace = await db.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    include: {
      channels: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  email: true,
                  clerkId: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              email: true,
              clerkId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!workspace) {
    redirect("/");
  }

  const member = workspace.members.find(
    (member) => member.user.clerkId === userId
  );

  if (!member) {
    redirect("/");
  }

  // Transform the data to match the expected types
  const transformedChannels = workspace.channels.map(channel => ({
    ...channel,
    type: channel.type as ChannelType, // Cast the type to match our enum
    members: channel.members.map(member => ({
      ...member,
      user: {
        ...member.user,
        imageUrl: member.user.imageUrl || null,
      }
    }))
  }));

  return (
    <WorkspaceSidebar
      channels={transformedChannels}
      members={workspace.members}
    />
  );
} 