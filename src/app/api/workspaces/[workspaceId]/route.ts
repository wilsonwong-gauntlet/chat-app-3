import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user is a member of the workspace
    const workspaceMember = await db.workspaceMember.findFirst({
      where: {
        workspaceId: params.workspaceId,
        userId: dbUser.id
      }
    });

    if (!workspaceMember) {
      return new NextResponse("Workspace not found", { status: 404 });
    }

    const workspace = await db.workspace.findUnique({
      where: {
        id: params.workspaceId
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                email: true
              }
            }
          }
        },
        channels: {
          where: {
            OR: [
              { type: "PUBLIC" },
              {
                members: {
                  some: {
                    userId: dbUser.id
                  }
                }
              }
            ]
          },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!workspace) {
      return new NextResponse("Workspace not found", { status: 404 });
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("[WORKSPACE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 