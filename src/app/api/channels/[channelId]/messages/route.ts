import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

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
        createdAt: "desc"
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

    const member = channel.members.find(
      (member) => member.user.clerkId === userId
    );

    if (!member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    // If this is a thread reply, verify parent message exists
    if (parentId) {
      const parentMessage = await db.message.findUnique({
        where: {
          id: parentId,
          channelId: params.channelId
        }
      });

      if (!parentMessage) {
        return new NextResponse("Parent message not found", { status: 404 });
      }
    }

    // Create the user's message
    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        channelId: channel.id,
        userId: member.userId,
        parentId
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

    // Send to RAG service (only for main messages, not replies)
    if (!parentId) {
      await sendMessageToRAG({
        id: message.id,
        content: message.content,
        channelId: message.channelId,
        workspaceId: channel.workspace.id,
        userId: message.userId,
        userName: message.user.name,
        channelName: message.channel.name,
        createdAt: message.createdAt,
      }).catch(error => {
        // Log error but don't fail the request
        console.error("RAG service error:", error);
      });

      // For direct messages, generate an AI response
      if (channel.type === "DIRECT") {
        // Get the other user in the DM
        const otherMember = channel.members.find(m => m.userId !== member.userId);
        
        if (otherMember) {
          const aiResponse = await generateAIResponse(
            channel.id,
            channel.workspace.id,
            member.userId,
            otherMember.userId,
            content
          );

          if (aiResponse) {
            // Create the AI response message
            const aiMessage = await db.message.create({
              data: {
                content: aiResponse.content,
                channelId: channel.id,
                userId: otherMember.userId,
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

            // Send AI message to RAG service
            await sendMessageToRAG({
              id: aiMessage.id,
              content: aiMessage.content,
              channelId: aiMessage.channelId,
              workspaceId: channel.workspace.id,
              userId: aiMessage.userId,
              userName: aiMessage.user.name,
              channelName: aiMessage.channel.name,
              createdAt: aiMessage.createdAt,
            }).catch(error => {
              console.error("RAG service error for AI message:", error);
            });

            // Trigger Pusher event for AI response
            await pusherServer.trigger(channel.id, "new-message", aiMessage);
          }
        }
      }
    }

    // If it's a thread reply, update the parent message and trigger in thread channel
    if (parentId) {
      const updatedParent = await db.message.findUnique({
        where: { id: parentId },
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

      if (updatedParent) {
        // Trigger update in main channel to update reply count
        await pusherServer.trigger(channel.id, "message-update", updatedParent);
        // Trigger new message in thread channel
        await pusherServer.trigger(
          `thread-${channel.id}-${parentId}`,
          "new-message",
          message
        );
      }
    } else {
      // If it's a main channel message, only trigger in the main channel
      await pusherServer.trigger(channel.id, "new-message", message);
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error",
      { status: 500 }
    );
  }
} 