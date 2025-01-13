import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

const memberSchema = z.object({
  userId: z.string()
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
    console.log("[CHANNEL_MEMBERS_POST] Request body:", body);
    const { userId: targetUserId } = memberSchema.parse(body);

    // Get the database user
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    console.log("[CHANNEL_MEMBERS_POST] Current user:", {
      clerkId: userId,
      dbUserId: dbUser.id
    });

    // Get the channel and check permissions
    const channel = await db.channel.findUnique({
      where: {
        id: params.channelId,
      },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: dbUser.id,
                role: "ADMIN"
              }
            }
          }
        }
      }
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    console.log("[CHANNEL_MEMBERS_POST] Channel:", {
      id: channel.id,
      name: channel.name,
      type: channel.type,
      workspaceId: channel.workspaceId
    });

    // Only workspace admins can add members to private channels
    if (channel.type === "PRIVATE" && channel.workspace.members.length === 0) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Check if target user is a member of the workspace
    const workspaceMember = await db.workspaceMember.findFirst({
      where: {
        userId: targetUserId,
        workspaceId: channel.workspaceId
      }
    });

    console.log("[CHANNEL_MEMBERS_POST] Target workspace member:", workspaceMember);

    if (!workspaceMember) {
      return new NextResponse("User is not a member of the workspace", { status: 400 });
    }

    // Check if user is already a member of the channel
    const existingMember = await db.channelMember.findFirst({
      where: {
        userId: targetUserId,
        channelId: params.channelId
      }
    });

    console.log("[CHANNEL_MEMBERS_POST] Existing channel member:", existingMember);

    if (existingMember) {
      return new NextResponse("User is already a member of the channel", { status: 409 });
    }

    // Add member to channel
    const member = await db.channelMember.create({
      data: {
        userId: targetUserId,
        channelId: params.channelId
      },
      include: {
        user: true
      }
    });

    console.log("[CHANNEL_MEMBERS_POST] Created channel member:", member);

    // Notify channel members
    await pusherServer.trigger(
      channel.workspaceId,
      "channel:member_add",
      {
        channelId: params.channelId,
        member
      }
    );

    return NextResponse.json(member);
  } catch (error) {
    console.error("[CHANNEL_MEMBERS_POST]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error",
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!targetUserId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Get the database user
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get the channel and check permissions
    const channel = await db.channel.findUnique({
      where: {
        id: params.channelId,
      },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: dbUser.id,
                role: "ADMIN"
              }
            }
          }
        }
      }
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    // Users can remove themselves, or workspace admins can remove anyone
    const isSelf = dbUser.id === targetUserId;
    const isAdmin = channel.workspace.members.length > 0;

    if (!isSelf && !isAdmin) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Cannot remove members from general channel
    if (channel.name === "general") {
      return new NextResponse(
        JSON.stringify({ error: "Cannot remove members from the general channel" }),
        { status: 400 }
      );
    }

    // Remove member from channel
    await db.channelMember.delete({
      where: {
        userId_channelId: {
          userId: targetUserId,
          channelId: params.channelId
        }
      }
    });

    // Notify channel members
    await pusherServer.trigger(
      channel.workspaceId,
      "channel:member_remove",
      {
        channelId: params.channelId,
        userId: targetUserId
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CHANNEL_MEMBERS_DELETE]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error",
      { status: 500 }
    );
  }
} 