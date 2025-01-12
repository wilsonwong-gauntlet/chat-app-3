import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    console.log("[PUSHER_AUTH] Request received");
    
    const { userId } = await auth();
    console.log("[PUSHER_AUTH] Auth check:", { userId });
    
    if (!userId) {
      console.log("[PUSHER_AUTH] No userId found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    console.log("[PUSHER_AUTH] Form data received:", {
      socketId: formData.get("socket_id"),
      channel: formData.get("channel_name")
    });

    const socketId = formData.get("socket_id");
    const channel = formData.get("channel_name");

    if (!socketId || !channel) {
      console.log("[PUSHER_AUTH] Missing fields:", { socketId, channel });
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        presence: true,
        status: true,
        lastSeen: true,
        isActive: true,
      }
    });

    console.log("[PUSHER_AUTH] User found:", { 
      userId: user?.id,
      hasUser: !!user 
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // For presence channels
    if (channel.toString().startsWith('presence-')) {
      console.log("[PUSHER_AUTH] Authorizing presence channel");
      
      const presenceData = {
        user_id: user.id,
        user_info: {
          id: user.id,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
          presence: user.presence,
          status: user.status,
          lastSeen: user.lastSeen,
          isActive: user.isActive,
        },
      };

      try {
        const authResponse = pusherServer.authorizeChannel(
          socketId.toString(),
          channel.toString(),
          presenceData
        );
        console.log("[PUSHER_AUTH] Authorization successful");
        return NextResponse.json(authResponse);
      } catch (authError: any) {
        console.error("[PUSHER_AUTH] Authorization failed:", {
          message: authError.message,
          stack: authError.stack
        });
        throw authError;
      }
    }

    // For private channels
    console.log("[PUSHER_AUTH] Authorizing private channel");
    const privateAuthResponse = pusherServer.authorizeChannel(
      socketId.toString(),
      channel.toString(),
      { user_id: user.id }  // Required for all channel types
    );

    return NextResponse.json(privateAuthResponse);
  } catch (error: any) {
    console.error("[PUSHER_AUTH] Detailed error:", {
      message: error.message,
      stack: error.stack
    });
    return new NextResponse("Internal Error", { status: 500 });
  }
} 