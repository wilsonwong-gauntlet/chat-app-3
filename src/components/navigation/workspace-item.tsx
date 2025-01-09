"use client";

import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WorkspaceItemProps {
  id: string;
  name: string;
}

export const WorkspaceItem = ({
  id,
  name,
}: WorkspaceItemProps) => {
  const params = useParams();
  const router = useRouter();

  const onClick = () => {
    router.push(`/workspaces/${id}`);
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-center w-12 h-12 rounded-md transition",
        params?.workspaceId === id && "bg-zinc-700/50 dark:bg-zinc-700",
        params?.workspaceId !== id && "hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50"
      )}
    >
      <p className="font-semibold text-xl text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
        {name[0].toUpperCase()}
      </p>
    </button>
  );
} 