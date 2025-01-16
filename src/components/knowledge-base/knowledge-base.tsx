"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocumentUpload } from "./document-upload";
import { DocumentCard } from "./document-card";
import { Document, User } from "@/types";
import { TooltipProvider } from "@/components/ui/tooltip";

interface KnowledgeBaseProps {
  documents: (Document & {
    user: User;
  })[];
  workspaceId: string;
}

export function KnowledgeBase({ documents, workspaceId }: KnowledgeBaseProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const router = useRouter();

  const handleDocumentAdded = () => {
    router.refresh();
    setIsUploadOpen(false);
  };

  const handleDocumentDeleted = () => {
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-12 border-b flex items-center justify-between px-4 bg-white dark:bg-zinc-900">
        <h1 className="text-lg font-semibold">Knowledge Base</h1>
        <Button
          onClick={() => setIsUploadOpen(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Upload Document
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((document) => (
              <DocumentCard 
                key={document.id}
                document={document}
                onDeleted={handleDocumentDeleted}
              />
            ))}
            {documents.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                <h3 className="text-lg font-semibold">No documents yet</h3>
                <p className="text-sm text-muted-foreground">
                  Upload documents to create a knowledge base for your workspace.
                </p>
              </div>
            )}
          </div>
        </TooltipProvider>
      </ScrollArea>
      <DocumentUpload
        workspaceId={workspaceId}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={handleDocumentAdded}
      />
    </div>
  );
} 