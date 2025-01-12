import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

const statusSchema = z.object({
  status: z.string(),
  workspaceId: z.string(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { status, workspaceId } = statusSchema.parse(body);

    // Update user status in database
    const user = await db.user.update({
      where: { clerkId: userId },
      data: {
        status,
        lastSeen: new Date(),
      },
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        imageUrl: true,
        presence: true,
        status: true,
        lastSeen: true,
        isActive: true,
      },
    });

    // Broadcast status update to workspace
    await pusherServer.trigger(
      `presence-workspace-${workspaceId}`,
      "presence:update",
      {
        userId: user.clerkId,
        presence: user.presence,
        status: user.status,
        lastSeen: user.lastSeen,
        isActive: user.isActive,
      }
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error("[STATUS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 