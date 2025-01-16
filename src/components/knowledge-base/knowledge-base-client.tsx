"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Document, User } from "@/types";
import { DocumentUpload } from "@/components/knowledge-base/document-upload";
import { DocumentCard } from "@/components/knowledge-base/document-card";
import { AIChat } from "@/components/knowledge-base/ai-chat";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";

interface KnowledgeBaseClientProps {
  initialDocuments: (Document & {
    user: User;
  })[];
  workspaceId: string;
}

export function KnowledgeBaseClient({
  initialDocuments,
  workspaceId
}: KnowledgeBaseClientProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const router = useRouter();

  const handleDocumentUploaded = () => {
    setIsUploadOpen(false);
    router.refresh();
  };

  const handleDocumentDeleted = () => {
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">
            Upload documents and chat with AI about them
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Upload Document
        </Button>
      </div>
      <Separator />
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Documents</h2>
            <TooltipProvider>
              {initialDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onDeleted={handleDocumentDeleted}
                />
              ))}
            </TooltipProvider>
            {initialDocuments.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No documents uploaded yet. Upload some documents to get started!
              </p>
            )}
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Chat with AI</h2>
            <AIChat workspaceId={workspaceId} />
          </div>
        </div>
      </div>
      <DocumentUpload
        workspaceId={workspaceId}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={handleDocumentUploaded}
      />
    </div>
  );
} 