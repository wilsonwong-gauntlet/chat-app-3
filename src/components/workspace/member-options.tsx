"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Shield,
  UserMinus,
  UserX
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface MemberOptionsProps {
  workspaceId: string;
  memberId: string;
  memberRole: string;
  isCurrentUser: boolean;
  trigger?: React.ReactNode;
}

export function MemberOptions({
  workspaceId,
  memberId,
  memberRole,
  isCurrentUser,
  trigger
}: MemberOptionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onRoleChange = async () => {
    try {
      setIsLoading(true);
      const newRole = memberRole === "ADMIN" ? "MEMBER" : "ADMIN";
      
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error("Failed to update member role");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRemove = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to remove member");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show the menu at all for current user
  if (isCurrentUser) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button
            size="icon"
            variant="ghost"
            disabled={isLoading}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={onRoleChange}
          disabled={isLoading}
          className="cursor-pointer"
        >
          <Shield className="h-4 w-4 mr-2" />
          {memberRole === "ADMIN" ? "Remove Admin" : "Make Admin"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onRemove}
          disabled={isLoading}
          className="cursor-pointer text-rose-500 focus:text-rose-500"
        >
          <UserX className="h-4 w-4 mr-2" />
          Remove Member
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 