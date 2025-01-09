import { useState } from "react";
import { Check, Moon, Sun, MinusCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserStatus, usePresence } from "@/hooks/use-presence";
import { UserStatusBadge } from "./user-status";

interface StatusOption {
  status: UserStatus;
  label: string;
  icon: React.ElementType;
}

const statusOptions: StatusOption[] = [
  { status: "ONLINE", label: "Active", icon: Sun },
  { status: "AWAY", label: "Away", icon: Moon },
  { status: "DO_NOT_DISTURB", label: "Do not disturb", icon: MinusCircle },
];

interface StatusDialogProps {
  children: React.ReactNode;
}

export function StatusDialog({ children }: StatusDialogProps) {
  const { presence, updateStatus } = usePresence();
  const [isOpen, setIsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState(presence.statusMessage || "");

  const handleStatusUpdate = async (status: UserStatus) => {
    await updateStatus(status, statusMessage);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update your status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <Button
                key={option.status}
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => handleStatusUpdate(option.status)}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
                {presence.status === option.status && (
                  <Check className="h-4 w-4 ml-auto" />
                )}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="status-message"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Status message
            </label>
            <Input
              id="status-message"
              placeholder="What's happening?"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleStatusUpdate(presence.status);
                }
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 