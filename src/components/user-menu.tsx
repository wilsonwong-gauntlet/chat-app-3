"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Check,
  ChevronDown,
  LogOut,
  Moon,
  Settings,
  SmileIcon,
  Sun,
  User as UserIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePresence } from "@/providers/presence-provider";
import { PresenceStatus } from "@/types";
import { UserAvatar } from "@/components/user-avatar";

const presenceOptions = [
  { label: "Active", value: PresenceStatus.ONLINE, icon: Sun },
  { label: "Away", value: PresenceStatus.AWAY, icon: Moon },
  { label: "Do Not Disturb", value: PresenceStatus.DND, icon: Moon },
];

export function UserMenu() {
  const { user } = useUser();
  const router = useRouter();
  const { onlineUsers, setUserPresence, setUserStatus } = usePresence();
  const [isStatusOpen, setIsStatusOpen] = React.useState(false);
  const [status, setStatus] = React.useState(onlineUsers[user?.id || ""]?.status || "");
  const [isLoading, setIsLoading] = React.useState(false);

  const currentPresence = onlineUsers[user?.id || ""]?.presence || PresenceStatus.OFFLINE;

  const handlePresenceChange = async (presence: PresenceStatus) => {
    try {
      setIsLoading(true);
      await setUserPresence(presence);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await setUserStatus(status);
      setIsStatusOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-12 w-full flex items-center justify-start gap-2 px-3 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50"
        >
          <UserAvatar
            userId={user.id}
            imageUrl={user.imageUrl}
            name={user.fullName || ""}
          />
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-sm font-semibold truncate w-full">
              {user.fullName}
            </span>
            <span className="text-xs text-muted-foreground truncate w-full">
              {status || "What's your status?"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start" alignOffset={11}>
        <div className="flex items-center gap-2 p-2">
          <UserAvatar
            userId={user.id}
            imageUrl={user.imageUrl}
            name={user.fullName || ""}
            className="h-12 w-12"
          />
          <div className="flex flex-col flex-1">
            <span className="font-semibold">{user.fullName}</span>
            <span className="text-xs text-muted-foreground">{user.emailAddresses[0].emailAddress}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="p-2">
          <form onSubmit={handleStatusChange} className="flex items-center gap-2">
            <Input
              placeholder="What's your status?"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isLoading}
              className="h-8"
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={isLoading}
              className="h-8"
            >
              Set
            </Button>
          </form>
        </div>
        <div className="px-2 pb-2">
          <div className="flex gap-1">
            {presenceOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  size="sm"
                  variant={currentPresence === option.value ? "default" : "outline"}
                  className="flex-1 h-8"
                  onClick={() => handlePresenceChange(option.value)}
                  disabled={isLoading}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {option.label}
                  {currentPresence === option.value && (
                    <Check className="h-4 w-4 ml-2" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/profile")}>
          <UserIcon className="h-4 w-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings")}>
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-rose-500 focus:text-rose-500" 
          onClick={() => router.push("/sign-out")}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 