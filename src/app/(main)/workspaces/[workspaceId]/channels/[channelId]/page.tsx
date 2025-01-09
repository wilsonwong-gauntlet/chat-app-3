import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";

async function getChannel(channelId: string, userId: string) {
  const channel = await db.channel.findUnique({
    where: {
      id: channelId,
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
        where: {
          parentId: null // Only fetch top-level messages
        },
        include: {
          user: true,
          channel: true,
          _count: {
            select: {
              replies: true
            }
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  return channel;
}

interface ChannelPageProps {
  params: {
    workspaceId: string;
    channelId: string;
  }
}

export default async function ChannelPage({
  params
}: ChannelPageProps) {
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
      <div className="flex-1">
        <MessageList
          channelId={channel.id}
          initialMessages={channel.messages}
        />
      </div>
      <div className="p-4 border-t dark:border-zinc-700">
        <MessageInput channelId={channel.id} />
      </div>
    </div>
  );
} 