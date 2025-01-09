import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";

async function getChannel(workspaceId: string, channelId: string, userId: string) {
  // First check if user is a member of the workspace
  const workspaceMember = await db.workspaceMember.findFirst({
    where: {
      workspace: {
        id: workspaceId
      },
      user: {
        clerkId: userId
      }
    }
  });

  if (!workspaceMember) {
    return null;
  }

  // Then check if user has access to the channel
  const channel = await db.channel.findFirst({
    where: {
      id: channelId,
      workspaceId,
      OR: [
        {
          type: "PUBLIC"
        },
        {
          members: {
            some: {
              user: {
                clerkId: userId
              }
            }
          }
        }
      ]
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc"
        },
        take: 50,
        include: {
          user: true
        }
      }
    }
  });

  return channel;
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

  const channel = await getChannel(params.workspaceId, params.channelId, userId);

  if (!channel) {
    redirect("/workspaces");
  }

  return (
    <div className="flex flex-col h-full">
      <MessageList
        channelId={params.channelId}
        initialMessages={channel.messages}
      />
      <div className="p-4 border-t">
        <MessageInput channelId={params.channelId} />
      </div>
    </div>
  );
} 