"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  Check,
  ChevronDown,
  LogOut,
  Moon,
  Settings,
  Sun,
  User as UserIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePresence } from "@/providers/presence-provider";
import { PresenceStatus } from "@/types";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

const presenceOptions = [
  { label: "Active", value: PresenceStatus.ONLINE, icon: Sun },
  { label: "Away", value: PresenceStatus.AWAY, icon: Moon },
  { label: "Do Not Disturb", value: PresenceStatus.DND, icon: Moon },
] as const;

const defaultPresenceOption = presenceOptions[0];

export function UserMenu() {
  const { user } = useUser();
  const router = useRouter();
  const { onlineUsers, setUserPresence, setUserStatus } = usePresence();
  const [isEditing, setIsEditing] = React.useState(false);
  const [status, setStatus] = React.useState(onlineUsers[user?.id || ""]?.status || "");
  const [isLoading, setIsLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const currentPresence = onlineUsers[user?.id || ""]?.presence || PresenceStatus.ONLINE;

  const getDisplayName = (user: any) => {
    if (!user) return "Anonymous User";
    return user.externalAccounts?.[0]?.username || user.emailAddresses?.[0]?.emailAddress?.split('@')[0] || "Anonymous User";
  };

  const handlePresenceChange = async (presence: PresenceStatus) => {
    try {
      setIsLoading(true);
      await setUserPresence(presence);
    } catch (error) {
      console.error("Failed to update presence:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsLoading(true);
      await setUserStatus(newStatus);
      setStatus(newStatus);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (!user) return null;

  const currentPresenceOption = presenceOptions.find(option => option.value === currentPresence) || defaultPresenceOption;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-12 w-full flex items-center justify-start gap-2 px-3 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50"
        >
          <div className="relative">
            <UserAvatar
              userId={user.id}
              imageUrl={user.imageUrl}
              name={getDisplayName(user)}
            />
            <div 
              className={cn(
                "absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-zinc-900",
                currentPresence === PresenceStatus.ONLINE && "bg-emerald-500",
                currentPresence === PresenceStatus.AWAY && "bg-yellow-500",
                currentPresence === PresenceStatus.DND && "bg-rose-500",
                currentPresence === PresenceStatus.OFFLINE && "bg-zinc-500",
              )}
            />
          </div>
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-sm font-semibold truncate w-full">
              {getDisplayName(user)}
            </span>
            <span className="text-xs text-muted-foreground truncate w-full">
              {status || "What's your status?"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="start" alignOffset={11}>
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <UserAvatar
                userId={user.id}
                imageUrl={user.imageUrl}
                name={getDisplayName(user)}
                className="h-10 w-10"
              />
              <div 
                className={cn(
                  "absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-zinc-900",
                  currentPresence === PresenceStatus.ONLINE && "bg-emerald-500",
                  currentPresence === PresenceStatus.AWAY && "bg-yellow-500",
                  currentPresence === PresenceStatus.DND && "bg-rose-500",
                  currentPresence === PresenceStatus.OFFLINE && "bg-zinc-500",
                )}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{getDisplayName(user)}</span>
              {isEditing ? (
                <Input
                  ref={inputRef}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  onBlur={() => handleStatusChange(status)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleStatusChange(status);
                    }
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                    }
                  }}
                  placeholder="What's your status?"
                  className="h-6 text-xs mt-1"
                />
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-muted-foreground hover:text-foreground text-left mt-1"
                >
                  {status || "Set a status"}
                </button>
              )}
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center">
            <currentPresenceOption.icon className="h-4 w-4 mr-2" />
            {currentPresenceOption.label}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {presenceOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handlePresenceChange(option.value)}
              >
                <option.icon className="h-4 w-4 mr-2" />
                {option.label}
                {currentPresence === option.value && (
                  <Check className="h-4 w-4 ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <UserIcon className="h-4 w-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-rose-500 focus:text-rose-500 cursor-pointer"
          asChild
        >
          <SignOutButton>
            <div className="flex items-center">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </div>
          </SignOutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 