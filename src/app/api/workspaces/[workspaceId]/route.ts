import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const updateWorkspaceSchema = z.object({
  name: z.string().min(1, {
    message: "Workspace name is required."
  }).max(32, {
    message: "Workspace name cannot be longer than 32 characters."
  }).regex(/^[a-zA-Z0-9-\s]+$/, {
    message: "Workspace name can only contain letters, numbers, spaces, and hyphens."
  })
});

export async function PATCH(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateWorkspaceSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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

    const updatedWorkspace = await db.workspace.update({
      where: {
        id: params.workspaceId
      },
      data: {
        name: validatedData.data.name
      }
    });

    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    console.error("[WORKSPACE_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 