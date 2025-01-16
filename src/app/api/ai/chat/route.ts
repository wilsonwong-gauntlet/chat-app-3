import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { generateKnowledgeBaseResponse } from "@/lib/rag";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { message, workspaceId } = await req.json();

    if (!message || !workspaceId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user has access to workspace
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        members: {
          some: {
            user: {
              clerkId: userId
            }
          }
        }
      }
    });

    if (!workspace) {
      return new NextResponse("Workspace not found", { status: 404 });
    }

    // Get AI response with document citations
    const response = await generateKnowledgeBaseResponse(workspaceId, message);

    // If we have source messages, fetch the document URLs
    if (response.sourceMessages?.length) {
      const documentIds = response.sourceMessages
        .filter(msg => msg.documentId)
        .map(msg => msg.documentId!);

      if (documentIds.length) {
        type DocumentSelect = Prisma.DocumentGetPayload<{
          select: { id: true; url: true }
        }>;

        const documents = await db.document.findMany({
          where: {
            id: {
              in: documentIds
            }
          },
          select: {
            id: true,
            url: true
          }
        });

        // Add document URLs to source messages
        response.sourceMessages = response.sourceMessages.map(msg => ({
          ...msg,
          documentUrl: documents.find((doc: DocumentSelect) => doc.id === msg.documentId)?.url
        }));
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[AI_CHAT_ERROR]", error);
    return NextResponse.json({
      content: "I encountered an error processing your request. Please try again.",
      messageId: 'error-' + Date.now(),
      sourceMessages: []
    }, { status: 500 });
  }
} 