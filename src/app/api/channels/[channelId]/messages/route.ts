import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

const messageSchema = z.object({
  content: z.string().min(1),
  parentId: z.string().optional()
});

export async function POST(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { content, parentId } = messageSchema.parse(body);

    const channel = await db.channel.findUnique({
      where: {
        id: params.channelId,
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
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    const member = channel.members.find(
      (member) => member.user.clerkId === userId
    );

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    // If this is a thread reply, verify parent message exists
    if (parentId) {
      const parentMessage = await db.message.findUnique({
        where: {
          id: parentId,
          channelId: params.channelId
        }
      });

      if (!parentMessage) {
        return new NextResponse("Parent message not found", { status: 404 });
      }
    }

    const message = await db.message.create({
      data: {
        content,
        channelId: channel.id,
        userId: member.userId,
        parentId
      },
      include: {
        user: true,
        channel: true,
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    // If it's a thread reply, update the parent message and trigger in thread channel
    if (parentId) {
      const updatedParent = await db.message.findUnique({
        where: { id: parentId },
        include: {
          user: true,
          channel: true,
          _count: {
            select: {
              replies: true
            }
          }
        }
      });

      if (updatedParent) {
        // Trigger update in main channel to update reply count
        await pusherServer.trigger(channel.id, "message-update", updatedParent);
        // Trigger new message in thread channel
        await pusherServer.trigger(
          `thread-${channel.id}-${parentId}`,
          "new-message",
          message
        );
      }
    } else {
      // If it's a main channel message, only trigger in the main channel
      await pusherServer.trigger(channel.id, "new-message", message);
    }

    return NextResponse.json(message);
  } catch (error) {
    console.log("[MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 