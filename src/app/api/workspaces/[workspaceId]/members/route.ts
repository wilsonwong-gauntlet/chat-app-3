import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, currentUser } from "@clerk/nextjs/server";

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

    // First check if user exists in our database
    const dbUser = await db.user.findFirst({
      where: {
        email: email
      }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "No user found with this email. They need to sign up first." },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await db.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: dbUser.id,
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
        userId: dbUser.id,
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
          userId: dbUser.id,
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