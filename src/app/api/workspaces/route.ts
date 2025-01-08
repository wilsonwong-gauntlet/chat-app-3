import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const createWorkspaceSchema = z.object({
  name: z.string().min(1, {
    message: "Workspace name is required."
  }).max(32, {
    message: "Workspace name cannot be longer than 32 characters."
  }).regex(/^[a-zA-Z0-9-\s]+$/, {
    message: "Workspace name can only contain letters, numbers, spaces, and hyphens."
  })
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createWorkspaceSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Create workspace with general channel in a transaction
    const workspace = await db.$transaction(async (tx) => {
      // Create the workspace
      const workspace = await tx.workspace.create({
        data: {
          name: validatedData.data.name,
          members: {
            create: {
              userId: user.id,
              role: "ADMIN"
            }
          }
        }
      });

      // Create the general channel
      await tx.channel.create({
        data: {
          name: "general",
          description: "General discussion channel",
          workspaceId: workspace.id,
          type: "PUBLIC",
          members: {
            create: {
              userId: user.id
            }
          }
        }
      });

      return workspace;
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("[WORKSPACES_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}