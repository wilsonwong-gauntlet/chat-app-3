import { ChevronDown, Settings } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Workspace } from "@/types";

interface ServerHeaderProps {
  workspace: Workspace;
  role?: string;
}

export const ServerHeader = ({
  workspace,
  role
}: ServerHeaderProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus:outline-none"
        asChild
      >
        <button
          className="w-full text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
        >
          {workspace.name}
          <ChevronDown className="h-5 w-5 ml-auto" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]"
      >
        {role === "ADMIN" && (
          <DropdownMenuItem
            className="text-indigo-600 dark:text-indigo-400 px-3 py-2 text-sm cursor-pointer"
          >
            Workspace Settings
            <Settings className="h-4 w-4 ml-auto" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 