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
    console.log("[PROCESS_DOCUMENT_REQUEST]", {
      url: `${process.env.RAG_SERVICE_URL}/process-document`,
      request
    });

    const response = await fetch(`${process.env.RAG_SERVICE_URL}/process-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[PROCESS_DOCUMENT_ERROR]", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Document processing error: ${errorText}`);
    }

    const result = await response.json();
    console.log("[PROCESS_DOCUMENT_RESPONSE]", result);
    return result;
  } catch (error) {
    console.error("[PROCESS_DOCUMENT_ERROR]", error);
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
      return {
        content: `AI response error: ${response.statusText}`,
        messageId: 'ai-' + Date.now(),
      };
    }

    const data = await response.json();
    
    // Handle both possible response formats
    const aiContent = data?.content || data?.response;
    
    if (typeof aiContent !== 'string') {
      console.error("[RAG] Invalid AI response format:", data);
      return {
        content: "I received an unexpected response format. Please try again.",
        messageId: 'ai-' + Date.now(),
      };
    }

    return {
      content: aiContent,
      messageId: 'ai-' + Date.now(),
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    return null;
  }
}

export async function generateKnowledgeBaseResponse(
  workspaceId: string,
  query: string,
): Promise<AIResponse> {
  try {
    const url = `${process.env.RAG_SERVICE_URL}/knowledge-base/generate`;
    console.log("[RAG] Request details:", { 
      url,
      workspaceId, 
      query,
      RAG_SERVICE_URL: process.env.RAG_SERVICE_URL 
    });

    if (!process.env.RAG_SERVICE_URL) {
      console.error("[RAG] RAG_SERVICE_URL is not configured");
      return {
        content: "I apologize, but I'm not configured properly at the moment. Please contact support.",
        messageId: 'ai-' + Date.now(),
        sourceMessages: []
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        workspaceId,
        limit: 5
      }),
    });

    console.log("[RAG] Response details:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      console.error("[RAG] Response not OK:", {
        status: response.status,
        statusText: response.statusText
      });
      return {
        content: `I encountered an error (${response.status}) while processing your request. Please try again later.`,
        messageId: 'ai-' + Date.now(),
        sourceMessages: []
      };
    }

    const rawData = await response.text();
    console.log("[RAG] Raw response:", rawData);

    let data;
    try {
      data = JSON.parse(rawData);
      console.log("[RAG] Parsed data:", JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error("[RAG] JSON parse error:", parseError);
      return {
        content: "I received an invalid JSON response. Please try again.",
        messageId: 'ai-' + Date.now(),
        sourceMessages: []
      };
    }

    console.log("[RAG] Extracted fields:", {
      hasResponse: !!data.response,
      responseType: typeof data.response,
      response: data.response,
      hasSourceMessages: !!data.sourceMessages,
      sourceMessagesLength: data.sourceMessages?.length
    });

    // Handle both possible response formats
    const content = data?.content || data?.response;
    
    if (typeof content !== 'string') {
      console.error("[RAG] Invalid content format:", { content, data });
      return {
        content: "The response format was unexpected. Please try again.",
        messageId: 'ai-' + Date.now(),
        sourceMessages: []
      };
    }

    const result = {
      content,
      messageId: 'ai-' + Date.now(),
      sourceMessages: Array.isArray(data.sourceMessages) ? data.sourceMessages : []
    };

    console.log("[RAG] Final result:", result);
    return result;
  } catch (error: unknown) {
    console.error("[RAG] Error:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      content: "I encountered an unexpected error. Please try again later.",
      messageId: 'ai-' + Date.now(),
      sourceMessages: []
    };
  }
}