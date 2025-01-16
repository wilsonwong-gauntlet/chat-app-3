import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DocumentStatus } from "@prisma/client";

// This endpoint receives callbacks from the RAG service after document processing
export async function POST(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const body = await req.json();
    const { status, error, vectorIds } = body;

    // Verify the document exists
    const document = await db.document.findUnique({
      where: { id: params.documentId }
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Update document status and store vector IDs
    await db.document.update({
      where: { id: params.documentId },
      data: {
        status: status as DocumentStatus,
        error: error || null,
        vectorIds: vectorIds || []
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DOCUMENT_CALLBACK_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 