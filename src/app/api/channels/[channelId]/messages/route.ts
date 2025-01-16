import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { sendMessageToRAG, generateAIResponse } from "@/lib/rag";

const messageSchema = z.object({
  content: z.string(),
  parentId: z.string().optional(),
  fileUrl: z.string().url().nullish()
}).refine((data) => {
  return data.content.length > 0 || (data.fileUrl !== null && data.fileUrl !== undefined);
}, {
  message: "Either message content or file attachment is required"
});

export async function GET(
  req: Request,
  { params }: { params: { channelId: string } }
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

    const messages = await db.message.findMany({
      where: {
        channelId: params.channelId,
        parentId: null // Only fetch top-level messages, not replies
      },
      include: {
        user: true,
        _count: {
          select: {
            replies: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      },
      take: 50 // Limit to last 50 messages
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.log("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { content, parentId, fileUrl } = messageSchema.parse(body);

    const channel = await db.channel.findUnique({
      where: {
        id: params.channelId,
        members: {
          some: {
            user: {
              clerkId: userId
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
        workspace: true
      }
    });

    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }

    const member = channel.members.find((member) => member.user.clerkId === userId);

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    // Create the message
    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        parentId,
        channelId: channel.id,
        userId: member.userId
      },
      include: {
        user: true,
        channel: true,
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    // Trigger Pusher event for the user's message immediately
    await pusherServer.trigger(channel.id, "new-message", message);

    // If this is a reply, update the parent message's reply count
    if (parentId) {
      const updatedParent = await db.message.findUnique({
        where: { id: parentId },
        include: {
          user: true,
          channel: true,
          _count: {
            select: { replies: true }
          }
        }
      });

      if (updatedParent) {
        // Trigger an update event for the parent message
        await pusherServer.trigger(channel.id, "message-update", updatedParent);
      }
    }

    // Process RAG and AI response asynchronously
    Promise.all([
      // Send to RAG service
      sendMessageToRAG({
        id: message.id,
        content: message.content,
        channelId: message.channelId,
        workspaceId: channel.workspace.id,
        userId: message.userId,
        userName: message.user.name,
        channelName: message.channel.name,
        createdAt: message.createdAt,
      }),

      // For direct messages, generate AI response asynchronously
      (async () => {
        if (channel.type === "DIRECT") {
          const otherMember = channel.members.find(m => m.userId !== member.userId);
          
          if (otherMember) {
            try {
              // Get recipient's current presence state
              const recipientUser = await db.user.findUnique({
                where: { clerkId: otherMember.user.clerkId },
                select: {
                  presence: true,
                  isActive: true,
                  lastSeen: true
                }
              });

              // Only generate AI response if user is not actively present
              const shouldGenerateAI = 
                !recipientUser?.isActive ||
                recipientUser?.presence === "OFFLINE" || 
                recipientUser?.presence === "AWAY" ||
                (recipientUser?.lastSeen && 
                 Date.now() - recipientUser.lastSeen.getTime() > 5 * 60 * 1000); // 5 minutes

              if (shouldGenerateAI) {
                const aiResponse = await generateAIResponse(
                  channel.workspace.id,
                  member.userId,
                  otherMember.userId,
                  message.content
                );

                if (aiResponse && aiResponse.content) {
                  // Create AI message
                  const aiMessage = await db.message.create({
                    data: {
                      content: aiResponse.content,
                      channelId: channel.id,
                      userId: otherMember.userId,
                      parentId: message.parentId,
                      isAIResponse: true
                    },
                    include: {
                      user: true,
                      channel: true,
                      _count: {
                        select: {
                          replies: true
                        }
                      }
                    }
                  });

                  await pusherServer.trigger(channel.id, "new-message", aiMessage);

                  // If AI response is a reply, update parent message's reply count
                  if (aiMessage.parentId) {
                    const updatedParent = await db.message.findUnique({
                      where: { id: aiMessage.parentId },
                      include: {
                        user: true,
                        channel: true,
                        _count: {
                          select: { replies: true }
                        }
                      }
                    });

                    if (updatedParent) {
                      await pusherServer.trigger(channel.id, "message-update", updatedParent);
                    }
                  }
                }
              }
            } catch (error) {
              console.error("AI response error:", error);
              if (error instanceof Error) {
                console.error("Error details:", {
                  message: error.message,
                  stack: error.stack,
                  name: error.name
                });
              }
            }
          }
        }
      })()
    ]).catch(console.error);

    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error",
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string; messageId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete the message
    const message = await db.message.delete({
      where: {
        id: params.messageId,
        channelId: params.channelId
      },
      include: {
        user: true,
        channel: true
      }
    });

    // Trigger Pusher event for message deletion
    await pusherServer.trigger(params.channelId, "message-delete", params.messageId);

    // If this was a reply, update the parent message's reply count
    if (message.parentId) {
      const updatedParent = await db.message.findUnique({
        where: { id: message.parentId },
        include: {
          user: true,
          channel: true,
          _count: {
            select: { replies: true }
          }
        }
      });

      if (updatedParent) {
        // Trigger an update event for the parent message
        await pusherServer.trigger(params.channelId, "message-update", updatedParent);
      }
    }

    return NextResponse.json(message);
  } catch (error) {
    console.log("[MESSAGE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 