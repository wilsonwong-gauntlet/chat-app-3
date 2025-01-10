import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(32).regex(/^[a-zA-Z0-9-\s]+$/)
});

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the user from our database
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get all workspaces where the user is a member
    const workspaces = await db.workspace.findMany({
      where: {
        members: {
          some: {
            userId: dbUser.id
          }
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("[WORKSPACES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = createWorkspaceSchema.parse(body);

    // Get the user from our database
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user already has a workspace with this name
    const existingWorkspace = await db.workspace.findFirst({
      where: {
        name,
        members: {
          some: {
            userId: dbUser.id
          }
        }
      }
    });

    if (existingWorkspace) {
      return new NextResponse("You already have a workspace with this name", { status: 400 });
    }

    // Create the workspace and add the creator as an admin
    const workspace = await db.workspace.create({
      data: {
        name,
        members: {
          create: {
            userId: dbUser.id,
            role: "ADMIN"
          }
        },
        channels: {
          create: {
            name: "general",
            description: "General discussion channel",
            type: "PUBLIC",
            members: {
              create: {
                userId: dbUser.id
              }
            }
          }
        }
      },
      include: {
        members: true,
        channels: true
      }
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("[WORKSPACES_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }

    return new NextResponse("Internal Error", { status: 500 });
  }
}