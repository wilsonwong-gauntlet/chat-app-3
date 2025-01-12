import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { Channel, ChannelType, Message, User } from "@/types";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { ChannelHeader } from "@/components/channel/channel-header";

interface ChannelWithMembersAndMessages extends Channel {
  members: {
    id: string;
    userId: string;
    channelId: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      imageUrl: string | null;
      clerkId: string;
    };
  }[];
  messages: (Message & {
    user: User;
    replies: (Message & {
      user: User;
    })[];
    _count: {
      replies: number;
    };
  })[];
}

function getOtherParticipantName(members: any[], userId: string) {
  const otherMember = members.find(member => member.user.id !== userId);
  return otherMember?.user.name || "Unknown User";
}

export default async function ChannelPage({
  params
}: {
  params: { workspaceId: string; channelId: string }
}) {
  const { userId } = await auth();

  if (!userId) {
    return notFound();
  }

  const channel = await db.channel.findUnique({
    where: {
      id: params.channelId,
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
              clerkId: true,
            }
          }
        }
      },
      messages: {
        take: 50,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          user: true,
          replies: {
            include: {
              user: true
            }
          },
          _count: {
            select: {
              replies: true
            }
          }
        }
      }
    }
  }) as ChannelWithMembersAndMessages | null;

  if (!channel) {
    return notFound();
  }

  return (
    <div className="flex flex-col h-full">
      <ChannelHeader channel={channel} />
      <div className="flex-1 overflow-y-auto min-h-0">
        <MessageList
          channelId={channel.id}
          initialMessages={channel.messages}
        />
      </div>
      <div className="mt-auto px-4 pb-6">
        <MessageInput
          channelId={channel.id}
        />
      </div>
    </div>
  );
} 