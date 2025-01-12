import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { PresenceStatus } from "@/types";

const presenceSchema = z.object({
  presence: z.enum(["ONLINE", "OFFLINE", "AWAY", "DND"] as const),
  workspaceId: z.string(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { presence, workspaceId } = presenceSchema.parse(body);

    // Update user presence in database
    const user = await db.user.update({
      where: { clerkId: userId },
      data: {
        presence: presence as PresenceStatus,
        lastSeen: new Date(),
        isActive: presence === PresenceStatus.ONLINE,
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        presence: true,
        status: true,
        lastSeen: true,
        isActive: true,
      },
    });

    // Broadcast presence update to workspace channel
    await pusherServer.trigger(
      `presence-workspace-${workspaceId}`,
      "presence:update",
      {
        userId: user.id,
        presence: user.presence,
        status: user.status,
        lastSeen: user.lastSeen,
        isActive: user.isActive,
      }
    );

    console.log("[PRESENCE_POST] Updated presence for user", {
      userId: user.id,
      presence: user.presence,
      workspaceId,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PRESENCE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 