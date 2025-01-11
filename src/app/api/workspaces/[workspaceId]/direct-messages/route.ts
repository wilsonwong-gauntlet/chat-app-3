import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";

const createDMSchema = z.object({
  userId: z.string().min(1)
});

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId: currentClerkId } = await auth();

    if (!currentClerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { userId: targetClerkId } = createDMSchema.parse(body);

    // First, get both users from the database using their Clerk IDs
    const [currentUser, targetUser] = await Promise.all([
      db.user.findUnique({
        where: { clerkId: currentClerkId }
      }),
      db.user.findUnique({
        where: { clerkId: targetClerkId }
      })
    ]);

    if (!currentUser || !targetUser) {
      return new NextResponse("One or both users not found", { status: 404 });
    }

    // Now check if both users are members of the workspace
    const [currentMember, targetMember] = await Promise.all([
      db.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: currentUser.id,
            workspaceId: params.workspaceId
          }
        }
      }),
      db.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: targetUser.id,
            workspaceId: params.workspaceId
          }
        }
      })
    ]);

    if (!currentMember || !targetMember) {
      return new NextResponse("Users must be in the same workspace", { status: 400 });
    }

    // Check if DM channel already exists between these users
    const existingChannel = await db.channel.findFirst({
      where: {
        workspaceId: params.workspaceId,
        type: "DIRECT",
        AND: [
          {
            members: {
              some: {
                userId: currentUser.id
              }
            }
          },
          {
            members: {
              some: {
                userId: targetUser.id
              }
            }
          }
        ]
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (existingChannel) {
      return NextResponse.json(existingChannel);
    }

    // Create new DM channel
    const channel = await db.channel.create({
      data: {
        name: `dm-${Date.now()}`,
        type: "DIRECT",
        workspaceId: params.workspaceId,
        members: {
          createMany: {
            data: [
              { userId: currentUser.id },
              { userId: targetUser.id }
            ]
          }
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
    console.log("[DIRECT_MESSAGE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 