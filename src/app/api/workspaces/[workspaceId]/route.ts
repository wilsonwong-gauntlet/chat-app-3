import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { Role } from "@prisma/client";

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
                clerkId: true,
                name: true,
                imageUrl: true,
                email: true
              }
            }
          },
          orderBy: {
            role: "asc"
          }
        },
        channels: {
          where: {
            OR: [
              {
                type: "PUBLIC"
              },
              {
                AND: [
                  { type: "PRIVATE" },
                  {
                    members: {
                      some: {
                        userId: dbUser.id
                      }
                    }
                  }
                ]
              },
              {
                type: "DIRECT",
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
                    clerkId: true,
                    name: true,
                    imageUrl: true,
                    email: true
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

export async function DELETE(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is a member and an admin
    const workspace = await db.workspace.findUnique({
      where: {
        id: params.workspaceId,
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!workspace) {
      return new NextResponse("Workspace not found", { status: 404 });
    }

    const member = workspace.members.find(
      (member) => member.user.clerkId === userId
    );

    if (!member || member.role !== Role.ADMIN) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Delete the workspace and all related data (Prisma will handle cascading deletes)
    await db.workspace.delete({
      where: {
        id: params.workspaceId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[WORKSPACE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 