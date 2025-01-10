import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

const updateChannelSchema = z.object({
  name: z.string()
    .min(1, { message: "Channel name is required" })
    .max(64, { message: "Channel name cannot be longer than 64 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Channel name can only contain lowercase letters, numbers, and hyphens"
    })
    .optional(),
  description: z.string().max(1000).optional(),
  type: z.enum(["PUBLIC", "PRIVATE"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateChannelSchema.parse(body);

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

    // Only workspace admins can update channels
    if (channel.workspace.members.length === 0) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Check if new name is already taken in the workspace
    if (validatedData.name) {
      const existingChannel = await db.channel.findFirst({
        where: {
          workspaceId: channel.workspaceId,
          name: validatedData.name,
          id: {
            not: channel.id
          }
        }
      });

      if (existingChannel) {
        return new NextResponse(
          JSON.stringify({ error: "Channel name already exists in this workspace" }),
          { status: 409 }
        );
      }
    }

    // Update channel
    const updatedChannel = await db.channel.update({
      where: {
        id: params.channelId
      },
      data: validatedData,
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    // Notify channel members of the update
    await pusherServer.trigger(
      channel.workspaceId,
      "channel:update",
      updatedChannel
    );

    return NextResponse.json(updatedChannel);
  } catch (error) {
    console.error("[CHANNEL_PATCH]", error);
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

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
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

    // Only workspace admins can delete channels
    if (channel.workspace.members.length === 0) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Cannot delete the general channel
    if (channel.name === "general") {
      return new NextResponse(
        JSON.stringify({ error: "Cannot delete the general channel" }),
        { status: 400 }
      );
    }

    // Delete the channel
    await db.channel.delete({
      where: {
        id: params.channelId
      }
    });

    // Notify workspace members of the deletion
    await pusherServer.trigger(
      channel.workspaceId,
      "channel:delete",
      params.channelId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CHANNEL_DELETE]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error",
      { status: 500 }
    );
  }
} 