import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { ChannelType } from "@/types";

const createChannelSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["PUBLIC", "PRIVATE", "DIRECT"]),
  memberIds: z.array(z.string()).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    
    const type = searchParams.get("type") as ChannelType | null;
    const memberId = searchParams.get("memberId");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the database user
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Base query to find channels in the workspace where user is a member
    const baseQuery = {
      workspaceId: params.workspaceId,
      members: {
        some: {
          userId: dbUser.id
        }
      }
    };

    // If searching for DMs with a specific member
    if (type === "DIRECT" && memberId) {
      const channels = await db.channel.findMany({
        where: {
          ...baseQuery,
          type: "DIRECT",
          members: {
            every: {
              userId: {
                in: [dbUser.id, memberId]
              }
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
      
      return NextResponse.json(channels);
    }

    // Regular channel query with optional type filter
    const channels = await db.channel.findMany({
      where: {
        ...baseQuery,
        ...(type ? { type } : {})
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json(channels);
  } catch (error) {
    console.error("[CHANNELS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await req.json();
    console.log("[CHANNELS_POST] Request body:", body);

    let validatedData;
    try {
      validatedData = createChannelSchema.parse(body);
      console.log("[CHANNELS_POST] Parsed data:", validatedData);
    } catch (error) {
      console.error("[CHANNELS_POST] Validation error:", error);
      return new NextResponse(
        JSON.stringify({ error: "Invalid request data", details: error }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { name, type, memberIds } = validatedData;

    // Get the database user
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true
      }
    });

    if (!dbUser) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user is a member of the workspace
    const workspace = await db.workspace.findFirst({
      where: {
        id: params.workspaceId,
        members: {
          some: {
            userId: dbUser.id
          }
        }
      }
    });

    if (!workspace) {
      return new NextResponse(
        JSON.stringify({ error: "Workspace not found" }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // For DM channels, verify the target member exists and is in the workspace
    if (type === "DIRECT" && memberIds?.length === 1) {
      console.log("[CHANNELS_POST] Checking DM prerequisites");
      
      // Prevent self-DMs
      if (memberIds[0] === dbUser.id) {
        return new NextResponse(
          JSON.stringify({ error: "Cannot create DM with yourself" }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      const targetMember = await db.workspaceMember.findFirst({
        where: {
          workspaceId: workspace.id,
          userId: memberIds[0]
        }
      });

      if (!targetMember) {
        return new NextResponse(
          JSON.stringify({ error: "Target member not found in workspace" }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if DM channel already exists
      const existingDM = await db.channel.findFirst({
        where: {
          workspaceId: workspace.id,
          type: "DIRECT",
          AND: [
            {
              members: {
                some: {
                  userId: dbUser.id
                }
              }
            },
            {
              members: {
                some: {
                  userId: memberIds[0]
                }
              }
            }
          ]
        }
      });

      if (existingDM) {
        return new NextResponse(
          JSON.stringify({ error: "DM channel already exists", channel: existingDM }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    console.log("[CHANNELS_POST] Creating channel with data:", {
      name,
      type,
      workspaceId: workspace.id,
      currentUserId: dbUser.id,
      memberIds
    });

    const channel = await db.channel.create({
      data: {
        name,
        type,
        workspaceId: workspace.id,
        members: {
          create: [
            {
              userId: dbUser.id
            },
            ...(memberIds?.map(id => ({ userId: id })) || [])
          ]
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
    console.error("[CHANNELS_POST] Detailed error:", {
      name: error instanceof Error ? error.name : "Unknown error",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 