import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(32).regex(/^[a-zA-Z0-9-\s]+$/)
});

export async function GET() {
  try {
    const dbUser = await getCurrentUser();

    if (!dbUser) {
      return new NextResponse("Unauthorized", { status: 401 });
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
    const dbUser = await getCurrentUser();

    if (!dbUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = createWorkspaceSchema.parse(body);

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
    return new NextResponse("Internal Error", { status: 500 });
  }
}