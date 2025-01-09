import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

const UserStatus = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  AWAY: 'AWAY',
  DO_NOT_DISTURB: 'DO_NOT_DISTURB'
} as const;

type UserStatus = typeof UserStatus[keyof typeof UserStatus];

const updatePresenceSchema = z.object({
  status: z.enum(['ONLINE', 'OFFLINE', 'AWAY', 'DO_NOT_DISTURB'] as const),
  statusMessage: z.string().optional(),
});

const presenceSelect = {
  id: true,
  status: true,
  statusMessage: true,
  lastSeen: true,
} as const;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { status, statusMessage } = updatePresenceSchema.parse(body);

    const user = await db.user.findFirst({
      where: { clerkId: userId }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        status,
        statusMessage,
        lastSeen: new Date(),
      },
      select: presenceSelect
    });

    // Notify all workspaces where the user is a member
    const workspaces = await db.workspaceMember.findMany({
      where: { userId: user.id },
      select: { workspaceId: true }
    });

    // Broadcast presence update to all user's workspaces
    for (const workspace of workspaces) {
      await pusherServer.trigger(
        `presence-workspace-${workspace.workspaceId}`,
        "presence-update",
        updatedUser
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[PRESENCE_POST]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error",
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findFirst({
      where: { clerkId: userId },
      select: presenceSelect
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PRESENCE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 