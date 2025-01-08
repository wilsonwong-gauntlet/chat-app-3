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
        params?.workspaceId === id && "bg-zinc-700",
        params?.workspaceId !== id && "hover:bg-zinc-700"
      )}
    >
      <p className="font-semibold text-xl text-white">
        {name[0].toUpperCase()}
      </p>
    </button>
  );
} 