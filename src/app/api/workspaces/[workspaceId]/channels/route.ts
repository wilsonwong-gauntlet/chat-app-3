import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = await auth();
    const { name, type, description } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!type) {
      return new NextResponse("Type is required", { status: 400 });
    }

    if (!params.workspaceId) {
      return new NextResponse("Workspace ID is required", { status: 400 });
    }

    // Get the user from our database
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user is an admin of the workspace
    const workspace = await db.workspace.findFirst({
      where: {
        id: params.workspaceId,
        members: {
          some: {
            userId: dbUser.id,
            role: "ADMIN"
          }
        }
      }
    });

    if (!workspace) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if channel name already exists in workspace
    const existingChannel = await db.channel.findFirst({
      where: {
        workspaceId: params.workspaceId,
        name
      }
    });

    if (existingChannel) {
      return new NextResponse("Channel name already exists", { status: 400 });
    }

    // Create the channel and add all workspace members to it if public
    const channel = await db.channel.create({
      data: {
        name,
        type,
        description,
        workspaceId: params.workspaceId,
        members: {
          create: type === "PUBLIC"
            ? await db.workspaceMember.findMany({
                where: { workspaceId: params.workspaceId },
                select: { userId: true }
              })
            : [{ userId: dbUser.id }]
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json(channel);
  } catch (error) {
    console.log("[CHANNELS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 