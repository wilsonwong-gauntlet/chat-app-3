import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
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
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {channel.messages.map((message) => (
          <div key={message.id} className="flex items-start gap-x-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-x-2">
                <p className="font-semibold text-sm">
                  {message.user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="text-sm">
                {message.content}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <MessageInput channelId={params.channelId} />
      </div>
    </div>
  );
} 