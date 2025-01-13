import type { RAGMessageEvent, SearchQuery, SearchResult } from "../types";

export async function searchMessages(query: SearchQuery): Promise<SearchResult[]> {
  const response = await fetch(`${process.env.RAG_SERVICE_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...query,
      limit: query.limit || 5
    }),
  });

  if (!response.ok) {
    throw new Error(`Search error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.messages;
}

export async function sendMessageToRAG(message: RAGMessageEvent) {
  try {
    const response = await fetch(`${process.env.RAG_SERVICE_URL}/message-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`RAG service error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending message to RAG service:", error);
    // Don't throw - we don't want to break the main flow
  }
}

// Helper function to generate AI response
export async function generateAIResponse(
  channelId: string,
  workspaceId: string,
  senderId: string,
  receiverId: string,
  content: string,
): Promise<SearchResult | null> {
  try {
    const response = await searchMessages({
      query: content,
      workspaceId,
      channelId,
      receiverId,
      limit: 5
    });

    return response[0]; // Return the first (most relevant) AI response
  } catch (error) {
    console.error("Error generating AI response:", error);
    return null;
  }
} 