"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileAttachment } from "@/components/chat/file-attachment";

interface DocumentUploadProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

export function DocumentUpload({ workspaceId, isOpen, onClose, onUploaded }: DocumentUploadProps) {
  const handleDocumentUpload = async (fileUrl: string) => {
    try {
      const response = await fetch('/api/documents/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl,
          fileName: fileUrl.split("/").pop() || "document",
          fileType: fileUrl.split(".").pop()?.toLowerCase() || "unknown",
          workspaceId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process document');
      }

      onUploaded();
    } catch (error) {
      console.error('Document processing error:', error);
      // TODO: Add error toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogDescription>
          Upload a document to be processed by AI for enhanced context across your workspace.
          Supported formats: PDF, DOC, DOCX, TXT, MD
        </DialogDescription>
        <FileAttachment
          onFileUpload={handleDocumentUpload}
          onClose={onClose}
          acceptedTypes={["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/markdown"]}
        />
      </DialogContent>
    </Dialog>
  );
} 