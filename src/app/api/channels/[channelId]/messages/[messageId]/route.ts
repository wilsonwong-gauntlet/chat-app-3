import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

const messageSchema = z.object({
  content: z.string().min(1)
});

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string; messageId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { content } = messageSchema.parse(body);

    const message = await db.message.findUnique({
      where: {
        id: params.messageId,
        channelId: params.channelId,
        user: {
          clerkId: userId
        }
      },
      include: {
        user: true
      }
    });

    if (!message) {
      return new NextResponse("Message not found or unauthorized", { status: 404 });
    }

    const updatedMessage = await db.message.update({
      where: {
        id: params.messageId
      },
      data: {
        content
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

    await pusherServer.trigger(params.channelId, "message-update", updatedMessage);

    if (updatedMessage.parentId) {
      await pusherServer.trigger(
        `thread-${params.channelId}-${updatedMessage.parentId}`,
        "message-update",
        updatedMessage
      );
    }

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.log("[MESSAGE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string; messageId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const message = await db.message.findUnique({
      where: {
        id: params.messageId,
        channelId: params.channelId,
        user: {
          clerkId: userId
        }
      }
    });

    if (!message) {
      return new NextResponse("Message not found or unauthorized", { status: 404 });
    }

    await db.message.delete({
      where: {
        id: params.messageId
      }
    });

    await pusherServer.trigger(params.channelId, "message-delete", params.messageId);

    if (message.parentId) {
      const updatedParent = await db.message.findUnique({
        where: { id: message.parentId },
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
        await pusherServer.trigger(params.channelId, "message-update", updatedParent);
        await pusherServer.trigger(
          `thread-${params.channelId}-${message.parentId}`,
          "message-delete",
          params.messageId
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[MESSAGE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 