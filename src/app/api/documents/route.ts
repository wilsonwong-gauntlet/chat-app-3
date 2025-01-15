import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

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
            userId
          }
        }
      }
    });

    if (!workspace) {
      return new NextResponse("Workspace not found", { status: 404 });
    }

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
            id: userId
          }
        }
      }
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("[DOCUMENT_PROCESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 