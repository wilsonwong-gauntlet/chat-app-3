import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

const createChannelSchema = z.object({
  name: z.string()
    .min(1, { message: "Channel name is required." })
    .max(32, { message: "Channel name cannot be longer than 32 characters." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Channel name can only contain lowercase letters, numbers, and hyphens."
    }),
  type: z.enum(["PUBLIC", "PRIVATE"], {
    required_error: "Channel type is required."
  }),
  description: z.string().optional()
});

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the database user
    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const workspaceId = params.workspaceId;

    // Check if user is a member of the workspace
    const workspaceMember = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: user.id,
      },
    });

    if (!workspaceMember) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = createChannelSchema.parse(json);

    // Check if channel name already exists in workspace
    const existingChannel = await db.channel.findFirst({
      where: {
        workspaceId,
        name: body.name,
      },
    });

    if (existingChannel) {
      return new NextResponse(
        JSON.stringify({
          error: "A channel with this name already exists in this workspace."
        }),
        { status: 409 }
      );
    }

    // Create channel
    const channel = await db.channel.create({
      data: {
        name: body.name,
        type: body.type,
        description: body.description,
        workspaceId,
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
        }
      }
    });

    // Add creator as member
    await db.channelMember.create({
      data: {
        channelId: channel.id,
        userId: user.id,
      },
    });

    // Fetch the updated channel with the creator as member
    const updatedChannel = await db.channel.findUnique({
      where: {
        id: channel.id
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
        }
      }
    });

    // Notify workspace members of the new channel
    await pusherServer.trigger(
      workspaceId,
      "channel:create",
      updatedChannel
    );

    return new NextResponse(JSON.stringify(updatedChannel));
  } catch (error) {
    console.error("[CHANNELS_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors[0].message }), { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
} 