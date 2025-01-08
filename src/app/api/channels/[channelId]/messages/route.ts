import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

const messageSchema = z.object({
  content: z.string().min(1).max(2000)
});

export async function POST(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = messageSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Check if user has access to the channel
    const channel = await db.channel.findFirst({
      where: {
        id: params.channelId,
        OR: [
          {
            type: "PUBLIC"
          },
          {
            members: {
              some: {
                userId: user.id
              }
            }
          }
        ]
      }
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const message = await db.message.create({
      data: {
        content: validatedData.data.content,
        channelId: params.channelId,
        userId: user.id
      },
      include: {
        user: true
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 