import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { ChannelType, ChannelMember } from "@/types";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";

async function getChannel(workspaceId: string, channelId: string, userId: string) {
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
      workspaceId: workspaceId,
    },
    include: {
      members: {
        include: {
          user: true
        }
      },
      messages: {
        include: {
          user: true,
          reactions: {
            include: {
              user: true
            }
          },
          replies: {
            include: {
              user: true,
              reactions: {
                include: {
                  user: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 50
      }
    }
  });

  if (!channel) {
    return null;
  }

  // For private channels, check if user is a member
  if (channel.type === ChannelType.PRIVATE) {
    const isMember = channel.members.some((member: ChannelMember) => member.user.clerkId === userId);
    if (!isMember) {
      return "PRIVATE_NO_ACCESS";
    }
  }

  return {
    ...channel,
    messages: channel.messages.reverse()
  };
}

export default async function ChannelPage({
  params
}: {
  params: { workspaceId: string; channelId: string }
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Decode the IDs from the URL
  const decodedWorkspaceId = decodeURIComponent(params.workspaceId);
  const decodedChannelId = decodeURIComponent(params.channelId);

  const channel = await getChannel(decodedWorkspaceId, decodedChannelId, userId);

  if (!channel) {
    redirect(`/workspaces/${decodedWorkspaceId}`);
  }

  // Handle private channel access denied
  if (channel === "PRIVATE_NO_ACCESS") {
    // TODO: Add a proper UI for access denied
    // For now, redirect to workspace home
    redirect(`/workspaces/${decodedWorkspaceId}`);
  }

  const currentMember = channel.members.find((member: ChannelMember) => member.user.clerkId === userId);

  if (!currentMember) {
    redirect(`/workspaces/${decodedWorkspaceId}`);
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <div className="px-3 h-12 flex items-center border-b">
        <h2 className="text-md font-semibold flex items-center">
          {channel.type === ChannelType.PRIVATE ? (
            <span className="text-sm text-zinc-500 mr-2">🔒</span>
          ) : (
            <span className="text-sm text-zinc-500 mr-2">#</span>
          )}
          {channel.name}
          {channel.description && (
            <span className="text-sm text-zinc-500 ml-2">
              | {channel.description}
            </span>
          )}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <MessageList
          channelId={channel.id}
          initialMessages={channel.messages}
        />
      </div>
      <div className="p-4 border-t">
        <MessageInput
          channelId={channel.id}
        />
      </div>
    </div>
  );
} 