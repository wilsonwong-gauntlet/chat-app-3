import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

export async function POST(
  req: Request
) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    const { name, imageUrl } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    const workspace = await db.workspace.create({
      data: {
        name,
        imageUrl,
        members: {
          create: [
            {
              userId,
              role: "ADMIN"
            }
          ]
        }
      }
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.log("[WORKSPACES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 