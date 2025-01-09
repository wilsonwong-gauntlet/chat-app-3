import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";

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