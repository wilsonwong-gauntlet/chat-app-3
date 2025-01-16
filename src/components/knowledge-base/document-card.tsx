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
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  document: Document & {
    user: User;
  };
  onDeleted: () => void;
  viewMode: "grid" | "list";
}

export function DocumentCard({ document, onDeleted, viewMode }: DocumentCardProps) {
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

      onDeleted();
    } catch (error) {
      console.error("Failed to retry processing:", error);
      // TODO: Add error toast
    } finally {
      setIsRetrying(false);
    }
  };

  const statusIcon = {
    PENDING: <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />,
    PROCESSING: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
    COMPLETED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    FAILED: <AlertCircle className="h-4 w-4 text-red-500" />
  }[document.status];

  const statusText = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    COMPLETED: "Ready",
    FAILED: "Failed"
  }[document.status];

  if (viewMode === "list") {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{document.name}</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 rounded-full px-2 py-0.5 bg-muted text-xs font-medium">
                    {statusIcon}
                    <span>{statusText}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Document Status</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-0.5">
              <span>{document.type}</span>
              <span>•</span>
              <span>Added {format(new Date(document.createdAt), "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UserAvatar
            userId={document.user.id}
            imageUrl={document.user.imageUrl}
            name={document.user.name}
            clerkId={document.user.clerkId}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isDeleting}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {document.status === "FAILED" && (
                <DropdownMenuItem onClick={handleRetry} disabled={isRetrying}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Processing
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-500 focus:text-red-500"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 hover:bg-accent/5 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{document.name}</h3>
            <p className="text-sm text-muted-foreground">
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
            {document.status === "FAILED" && (
              <DropdownMenuItem onClick={handleRetry} disabled={isRetrying}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Processing
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 focus:text-red-500"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 rounded-full px-2 py-0.5 bg-muted text-xs font-medium">
              {statusIcon}
              <span>{statusText}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Document Status</TooltipContent>
        </Tooltip>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">{document.type}</span>
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