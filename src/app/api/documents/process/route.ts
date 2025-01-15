import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { processDocument } from "@/lib/rag";
import type { DocumentProcessRequest } from "@/types";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { fileUrl, fileName, fileType, workspaceId } = await req.json();

    if (!fileUrl || !fileName || !fileType || !workspaceId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

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

    // Get the user's ID from the database
    const user = await db.user.findFirst({
      where: {
        clerkId: userId
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Create document record
    const document = await db.document.create({
      data: {
        url: fileUrl,
        name: fileName,
        type: fileType,
        workspace: {
          connect: {
            id: workspaceId
          }
        },
        user: {
          connect: {
            id: user.id
          }
        }
      }
    });

    // Process document with RAG service
    try {
      const processRequest: DocumentProcessRequest = {
        documentId: document.id,
        fileUrl,
        workspaceId,
        fileName,
        fileType
      };
      
      await processDocument(processRequest);
    } catch (error) {
      console.error("[RAG_PROCESS_ERROR]", error);
      // Don't fail the request if RAG processing fails
      // The document is still uploaded and can be processed later
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("[DOCUMENT_PROCESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 