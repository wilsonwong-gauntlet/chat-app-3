"use client";

import { FileText, MoreVertical, Trash, AlertCircle, CheckCircle2, Clock, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

import { Document, DocumentStatus, User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DocumentCardProps {
  document: Document & {
    user: User;
  };
  onDeleted: () => void;
}

function StatusIndicator({ status, error, onRetry }: { 
  status: DocumentStatus; 
  error?: string | null;
  onRetry?: () => void;
}) {
  switch (status) {
    case DocumentStatus.COMPLETED:
      return (
        <Tooltip>
          <TooltipTrigger>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Document processed successfully</p>
          </TooltipContent>
        </Tooltip>
      );
    case DocumentStatus.PROCESSING:
      return (
        <Tooltip>
          <TooltipTrigger>
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Processing document...</p>
          </TooltipContent>
        </Tooltip>
      );
    case DocumentStatus.FAILED:
      return (
        <div className="flex items-center gap-x-1">
          <Tooltip>
            <TooltipTrigger>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Processing failed: {error || 'Unknown error'}</p>
            </TooltipContent>
          </Tooltip>
          {onRetry && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 hover:bg-transparent"
              onClick={onRetry}
            >
              <RefreshCw className="h-3 w-3 text-muted-foreground hover:text-primary" />
            </Button>
          )}
        </div>
      );
    default:
      return (
        <Tooltip>
          <TooltipTrigger>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Waiting to process...</p>
          </TooltipContent>
        </Tooltip>
      );
  }
}

export function DocumentCard({ document, onDeleted }: DocumentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/documents/${document.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      onDeleted();
    } catch (error) {
      console.error("Failed to delete document:", error);
      // TODO: Add error toast
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetry = async () => {
    try {
      setIsRetrying(true);
      const response = await fetch(`/api/documents/${document.id}/process`, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Failed to retry processing");
      }

      // Refresh to get updated status
      onDeleted();
    } catch (error) {
      console.error("Failed to retry processing:", error);
      // TODO: Add error toast
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-x-2">
          <div className="rounded-md bg-primary/10 p-2">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <h3 className="font-semibold">{document.name}</h3>
              <StatusIndicator 
                status={document.status} 
                error={document.error}
                onRetry={document.status === DocumentStatus.FAILED ? handleRetry : undefined}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Added {format(new Date(document.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isDeleting}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash className="h-4 w-4 mr-2" />
              )}
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">
          Type: {document.type}
        </p>
      </div>
      <div className="mt-4 flex items-center gap-x-2">
        <UserAvatar
          userId={document.user.id}
          imageUrl={document.user.imageUrl}
          name={document.user.name}
          clerkId={document.user.clerkId}
        />
        <div className="flex flex-col">
          <p className="text-sm font-medium">
            {document.user.name}
          </p>
          <p className="text-xs text-muted-foreground">
            Uploaded by
          </p>
        </div>
      </div>
    </div>
  );
} 