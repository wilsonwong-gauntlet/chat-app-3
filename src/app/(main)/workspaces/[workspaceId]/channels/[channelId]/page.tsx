import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { ChatContainer } from "@/components/chat/chat-container";

interface ChannelPageProps {
  params: {
    workspaceId: string;
    channelId: string;
  };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const channel = await db.channel.findUnique({
    where: {
      id: params.channelId,
      workspace: {
        id: params.workspaceId,
        members: {
          some: {
            userId
          }
        }
      }
    },
    include: {
      workspace: true
    }
  });

  if (!channel) {
    return redirect("/");
  }

  const messages = await db.message.findMany({
    where: {
      channelId: params.channelId,
      parentId: null // Only get top-level messages
    },
    include: {
      user: true,
      reactions: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 50
  });

  return (
    <div className="flex flex-col h-full">
      <ChatContainer
        channelId={params.channelId}
        messages={messages}
        onSendMessage={async (content: string, fileUrl?: string) => {
          "use server";
          await db.message.create({
            data: {
              content,
              fileUrl,
              channelId: params.channelId,
              userId
            }
          });
        }}
      />
    </div>
  );
} 