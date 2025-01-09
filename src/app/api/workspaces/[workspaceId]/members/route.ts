import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const addMemberSchema = z.object({
  email: z.string().email({
    message: "Invalid email address."
  })
});

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin of the workspace
    const workspace = await db.workspace.findFirst({
      where: {
        id: params.workspaceId,
        members: {
          some: {
            userId: user.id,
            role: "ADMIN"
          }
        }
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email } = addMemberSchema.parse(body);

    // Find user by email
    const memberToAdd = await db.user.findUnique({
      where: {
        email
      }
    });

    if (!memberToAdd) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await db.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: memberToAdd.id,
          workspaceId: workspace.id
        }
      }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member" },
        { status: 400 }
      );
    }

    // Add user to workspace
    const member = await db.workspaceMember.create({
      data: {
        userId: memberToAdd.id,
        workspaceId: workspace.id,
        role: "MEMBER"
      },
      include: {
        user: true
      }
    });

    // Add user to general channel
    const generalChannel = await db.channel.findFirst({
      where: {
        workspaceId: workspace.id,
        name: "general"
      }
    });

    if (generalChannel) {
      await db.channelMember.create({
        data: {
          userId: memberToAdd.id,
          channelId: generalChannel.id
        }
      });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("[WORKSPACE_MEMBERS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 