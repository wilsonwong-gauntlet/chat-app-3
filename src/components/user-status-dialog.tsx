import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Check, Clock, Moon, MinusCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserStatusIndicator } from "@/components/user-status";
import { usePresenceStore, UserStatus } from "@/hooks/use-presence";

interface StatusOption {
  status: UserStatus;
  label: string;
  icon: React.ReactNode;
}

const statusOptions: StatusOption[] = [
  {
    status: "ONLINE",
    label: "Active",
    icon: <Check className="h-4 w-4" />
  },
  {
    status: "AWAY",
    label: "Away",
    icon: <Clock className="h-4 w-4" />
  },
  {
    status: "DO_NOT_DISTURB",
    label: "Do not disturb",
    icon: <MinusCircle className="h-4 w-4" />
  },
  {
    status: "OFFLINE",
    label: "Invisible",
    icon: <Moon className="h-4 w-4" />
  }
];

interface UserStatusDialogProps {
  children: React.ReactNode;
}

export function UserStatusDialog({ children }: UserStatusDialogProps) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const setUserPresence = usePresenceStore((state) => state.setUserPresence);

  const onStatusSelect = async (status: UserStatus) => {
    if (!user) return;

    setUserPresence(user.id, {
      status,
      statusMessage,
      lastSeen: new Date()
    });

    // TODO: Update user status in database
    const response = await fetch("/api/users/status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status, statusMessage })
    });

    if (!response.ok) {
      console.error("Failed to update status");
      return;
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set your status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-2">
          <Input
            placeholder="What's your status?"
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
          />
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <Button
                key={option.status}
                variant="ghost"
                className="w-full justify-start gap-x-2"
                onClick={() => onStatusSelect(option.status)}
              >
                <UserStatusIndicator status={option.status} />
                <span>{option.label}</span>
                {option.icon}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 