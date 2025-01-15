"use client";

import { FileText, MoreVertical, Trash } from "lucide-react";
import { format } from "date-fns";

import { Document, User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";

interface DocumentCardProps {
  document: Document & {
    user: User;
  };
  onDeleted: () => void;
}

export function DocumentCard({ document, onDeleted }: DocumentCardProps) {
  const handleDelete = async () => {
    try {
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
            <h3 className="font-semibold">{document.name}</h3>
            <p className="text-xs text-muted-foreground">
              Added {format(new Date(document.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
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