"use client";

import * as React from "react";
import { MoreVertical, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChannelMemberOptionsProps {
  channelId: string;
  memberId: string;
  isCurrentUser: boolean;
  trigger?: React.ReactNode;
}

export function ChannelMemberOptions({
  channelId,
  memberId,
  isCurrentUser,
  trigger
}: ChannelMemberOptionsProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const onRemove = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/channels/${channelId}/members?userId=${memberId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove member");
      }
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