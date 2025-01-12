"use client";

import { useUser } from "@clerk/nextjs";
import { Check, Moon, Sun, Loader2 } from "lucide-react";
import { useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePresence } from "@/providers/presence-provider";
import { PresenceStatus } from "@/types";

interface UserStatusDialogProps {
  trigger: React.ReactNode;
}

const presenceOptions = [
  { label: "Active", value: PresenceStatus.ONLINE, icon: Sun },
  { label: "Away", value: PresenceStatus.AWAY, icon: Moon },
  { label: "Do Not Disturb", value: PresenceStatus.DND, icon: Moon },
];

export function UserStatusDialog({ trigger }: UserStatusDialogProps) {
  const { user } = useUser();
  const { onlineUsers, setUserPresence, setUserStatus } = usePresence();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(onlineUsers[user?.id || ""]?.status || "");
  const [isLoading, setIsLoading] = useState(false);

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
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set your status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="flex gap-2">
            {presenceOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  size="sm"
                  variant={currentPresence === option.value ? "default" : "outline"}
                  className="flex-1"
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
          <form onSubmit={handleStatusChange} className="flex items-center gap-2">
            <Input
              placeholder="What's your status?"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 