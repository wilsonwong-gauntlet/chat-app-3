import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { channelId: string; messageId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const channel = await db.channel.findUnique({
      where: {
        id: params.channelId,
        OR: [
          {
            type: "PUBLIC"
          },
          {
            members: {
              some: {
                user: {
                  clerkId: userId
                }
              }
            }
          }
        ]
      }
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    const replies = await db.message.findMany({
      where: {
        channelId: params.channelId,
        parentId: params.messageId
      },
      include: {
        user: true,
        channel: true,
        _count: {
          select: {
            replies: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return NextResponse.json(replies);
  } catch (error) {
    console.log("[REPLIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 