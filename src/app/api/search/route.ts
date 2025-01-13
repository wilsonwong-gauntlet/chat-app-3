import { auth } from "@clerk/nextjs/server";
import { searchMessages } from "@/lib/rag";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { query, workspaceId, channelId, limit } = await req.json();

    const results = await searchMessages({
      query,
      workspaceId,
      channelId,
      limit: limit || 5
    });

    return Response.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return new Response("Internal Error", { status: 500 });
  }
} 