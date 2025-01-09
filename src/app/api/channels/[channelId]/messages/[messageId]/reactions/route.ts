import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

export async function POST(
  req: Request,
  { params }: { params: { channelId: string; messageId: string } }
) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    const { emoji } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!emoji) {
      return new NextResponse("Emoji is required", { status: 400 });
    }

    // Get user's database ID
    const user = await db.user.findFirst({
      where: {
        clerkId: userId,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify channel membership
    const member = await db.channelMember.findFirst({
      where: {
        userId: user.id,
        channelId: params.channelId,
      },
    });

    if (!member) {
      return new NextResponse("Channel membership required", { status: 403 });
    }

    // Create or delete reaction (toggle)
    const existingReaction = await db.reaction.findFirst({
      where: {
        messageId: params.messageId,
        userId: user.id,
        emoji,
      },
    });

    if (existingReaction) {
      // Delete reaction if it exists
      await db.reaction.delete({
        where: {
          id: existingReaction.id,
        },
      });

      // Get updated reactions count
      const updatedReactions = await getReactionsWithCounts(params.messageId, user.id);

      // Trigger Pusher event for reaction removal
      await pusherServer.trigger(
        params.channelId,
        "reaction:update",
        {
          messageId: params.messageId,
          reactions: updatedReactions
        }
      );

      return NextResponse.json({ reactions: updatedReactions });
    }

    // Create new reaction
    await db.reaction.create({
      data: {
        emoji,
        messageId: params.messageId,
        userId: user.id,
      },
    });

    // Get updated reactions count
    const updatedReactions = await getReactionsWithCounts(params.messageId, user.id);

    // Trigger Pusher event for new reaction
    await pusherServer.trigger(
      params.channelId,
      "reaction:update",
      {
        messageId: params.messageId,
        reactions: updatedReactions
      }
    );

    return NextResponse.json({ reactions: updatedReactions });
  } catch (error) {
    console.error("[REACTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { channelId: string; messageId: string } }
) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's database ID
    const user = await db.user.findFirst({
      where: {
        clerkId: userId,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify channel membership
    const member = await db.channelMember.findFirst({
      where: {
        userId: user.id,
        channelId: params.channelId,
      },
    });

    if (!member) {
      return new NextResponse("Channel membership required", { status: 403 });
    }

    const reactions = await getReactionsWithCounts(params.messageId, user.id);
    return NextResponse.json({ reactions });
  } catch (error) {
    console.error("[REACTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Helper function to get reactions with counts
async function getReactionsWithCounts(messageId: string, userId: string) {
  const reactions = await db.reaction.groupBy({
    by: ["emoji"],
    where: {
      messageId,
    },
    _count: true,
  });

  const userReactions = await db.reaction.findMany({
    where: {
      messageId,
      userId,
    },
    select: {
      emoji: true,
    },
  });

  return reactions.map((r) => ({
    emoji: r.emoji,
    count: r._count,
    hasReacted: userReactions.some((ur) => ur.emoji === r.emoji),
  }));
} 