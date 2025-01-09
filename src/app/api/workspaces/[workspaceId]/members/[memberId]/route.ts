import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const updateMemberSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"])
});

export async function PATCH(
  req: Request,
  { params }: { params: { workspaceId: string; memberId: string } }
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
    const { role } = updateMemberSchema.parse(body);

    // Update member role
    const updatedMember = await db.workspaceMember.update({
      where: {
        id: params.memberId,
        workspaceId: params.workspaceId,
      },
      data: {
        role
      },
      include: {
        user: true
      }
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("[WORKSPACE_MEMBER_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { workspaceId: string; memberId: string } }
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

    // Delete member
    await db.workspaceMember.delete({
      where: {
        id: params.memberId,
        workspaceId: params.workspaceId,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WORKSPACE_MEMBER_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 