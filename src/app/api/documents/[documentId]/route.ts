import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { db } from "@/lib/db";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the document and check if user has access
    const document = await db.document.findFirst({
      where: {
        id: params.documentId,
        workspace: {
          members: {
            some: {
              user: {
                clerkId: userId
              }
            }
          }
        }
      }
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Delete from RAG service
    /*
    try {
      const response = await fetch(`${process.env.RAG_SERVICE_URL}/delete-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          workspaceId: document.workspaceId
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete document from RAG service: ${response.statusText}`);
      }
    } catch (error) {
      console.error("[RAG_DELETE_ERROR]", error);
      // Continue with deletion even if RAG service fails
    }
    */

    // Delete from S3
    try {
      const key = document.url.split("/").pop();
      if (key) {
        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: `uploads/${key}`
        }));
      }
    } catch (error) {
      console.error("[S3_DELETE_ERROR]", error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    await db.document.delete({
      where: {
        id: params.documentId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DOCUMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 