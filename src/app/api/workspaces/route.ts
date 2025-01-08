import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(32).regex(/^[a-zA-Z0-9-\s]+$/),
  imageUrl: z.string().min(1)
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

    const { name, imageUrl } = validatedData.data;

    const workspace = await db.workspace.create({
      data: {
        name,
        imageUrl,
        members: {
          create: {
            userId: user.id,
            role: "ADMIN"
          }
        },
        channels: {
          create: {
            name: "general",
            type: "PUBLIC",
            description: "General discussion channel",
            members: {
              create: {
                userId: user.id
              }
            }
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        channels: {
          include: {
            members: true
          }
        }
      }
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("[WORKSPACE_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}