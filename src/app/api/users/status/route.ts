import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { USER_STATUS } from "@/hooks/use-presence";

export async function PATCH(
  req: Request
) {
  try {
    const authData = await auth();
    const userId = authData.userId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status, statusMessage } = await req.json();

    if (!status || !Object.values(USER_STATUS).includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: {
        clerkId: userId
      },
      data: {
        status,
        statusMessage,
        lastSeen: new Date()
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_STATUS_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 