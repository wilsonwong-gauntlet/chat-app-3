"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DeleteWorkspaceButtonProps {
  workspaceId: string;
  workspaceName: string;
  channelCount: number;
  memberCount: number;
}

export function DeleteWorkspaceButton({
  workspaceId,
  workspaceName,
  channelCount,
  memberCount
}: DeleteWorkspaceButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete workspace");
      }

      toast.success("Workspace deleted successfully");
      router.refresh();
      router.push("/workspaces");
    } catch (error) {
      console.error("[DELETE_WORKSPACE]", error);
      toast.error("Failed to delete workspace");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isLoading}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Workspace
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            {" "}{workspaceName} workspace and remove all data including:
            <ul className="list-disc list-inside mt-2">
              <li>{channelCount} channels</li>
              <li>{memberCount} members</li>
              <li>All messages and files</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete Workspace
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 