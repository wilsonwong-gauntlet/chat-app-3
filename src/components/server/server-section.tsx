import { Plus } from "lucide-react";

import { ServerWithMembersWithProfiles } from "@/types";
import { ActionTooltip } from "@/components/action-tooltip";

interface ServerSectionProps {
  label: string;
  role?: string;
  sectionType: "channels" | "members";
  channelType?: "TEXT" | "AUDIO" | "VIDEO";
}

export const ServerSection = ({
  label,
  role,
  sectionType,
  channelType
}: ServerSectionProps) => {
  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      {role === "ADMIN" && sectionType === "channels" && (
        <ActionTooltip label="Create Channel" side="top">
          <button
            className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        </ActionTooltip>
      )}
    </div>
  )
} 