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
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { userId: targetUserId } = createDMSchema.parse(body);

    // Check if users are in the same workspace
    const [currentMember, targetMember] = await Promise.all([
      db.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: currentUserId,
            workspaceId: params.workspaceId
          }
        }
      }),
      db.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: targetUserId,
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
                userId: currentUserId
              }
            }
          },
          {
            members: {
              some: {
                userId: targetUserId
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
        name: "dm", // This will be displayed as the other user's name in the UI
        type: "DIRECT",
        workspaceId: params.workspaceId,
        members: {
          createMany: {
            data: [
              { userId: currentUserId },
              { userId: targetUserId }
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