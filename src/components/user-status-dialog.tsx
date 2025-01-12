"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { usePresence } from "@/providers/presence-provider";
import { PresenceStatus } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserStatusDialogProps {
  trigger: React.ReactNode;
}

const PRESENCE_OPTIONS: { label: string; value: PresenceStatus; icon: string }[] = [
  { label: "Active", value: "ONLINE", icon: "🟢" },
  { label: "Away", value: "AWAY", icon: "🌙" },
  { label: "Do Not Disturb", value: "DND", icon: "⛔" },
  { label: "Offline", value: "OFFLINE", icon: "⭕" },
];

export function UserStatusDialog({ trigger }: UserStatusDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("");
  const { setUserStatus, setUserPresence } = usePresence();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await setUserStatus(status);
    setIsOpen(false);
  };

  const handlePresenceChange = async (presence: PresenceStatus) => {
    await setUserPresence(presence);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update your status</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  {PRESENCE_OPTIONS.find(opt => opt.value === "ONLINE")?.icon}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {PRESENCE_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handlePresenceChange(option.value)}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              placeholder="What's your status?"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 