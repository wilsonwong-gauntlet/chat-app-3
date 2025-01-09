import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

async function getChannel(channelId: string, userId: string) {
  // First get the database user
  const dbUser = await db.user.findUnique({
    where: { clerkId: userId }
  });

  if (!dbUser) {
    return null;
  }

  const channel = await db.channel.findUnique({
    where: {
      id: channelId,
    },
    include: {
      workspace: {
        include: {
          members: {
            where: {
              userId: dbUser.id
            }
          }
        }
      },
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
    }
  });

  if (!channel) {
    return null;
  }

  // Check if user is a member of the workspace
  if (channel.workspace.members.length === 0) {
    return null;
  }

  // For private channels, check if user is a member
  if (channel.type === "PRIVATE") {
    const isMember = channel.members.some(member => member.userId === dbUser.id);
    if (!isMember) {
      return null;
    }
  }

  return channel;
}

export default async function ChannelPage({
  params
}: {
  params: { channelId: string }
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const channel = await getChannel(params.channelId, userId);

  if (!channel) {
    redirect("/workspaces");
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 h-12 flex items-center border-b">
        <h2 className="text-md font-semibold flex items-center">
          {channel.type === "PRIVATE" ? (
            <span className="text-sm text-zinc-500 mr-2">🔒</span>
          ) : (
            <span className="text-sm text-zinc-500 mr-2">#</span>
          )}
          {channel.name}
        </h2>
      </div>
      <div className="flex-1 p-4">
        {channel.description && (
          <p className="text-sm text-zinc-500 mb-4">{channel.description}</p>
        )}
        {/* Message list will go here */}
      </div>
    </div>
  );
} 