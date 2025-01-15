import type { RAGMessageEvent, SearchQuery, SearchResult, AIResponse, GenerateRequest, DocumentProcessRequest } from "../types";

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

export async function processDocument(request: DocumentProcessRequest) {
  try {
    const response = await fetch(`${process.env.RAG_SERVICE_URL}/process-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Document processing error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error processing document:", error);
    throw error;
  }
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

export async function generateAIResponse(
  workspaceId: string,
  senderId: string,
  receiverId: string,
  content: string,
): Promise<SearchResult | null> {
  try {
    const request: GenerateRequest = {
      query: content,
      workspaceId,
      receiverId,
      limit: 5
    };

    const response = await fetch(`${process.env.RAG_SERVICE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`AI response error: ${response.statusText}`);
    }

    const data: AIResponse = await response.json();
    
    return {
      content: data.response,
      messageId: 'ai-' + Date.now(),
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    return null;
  }
}