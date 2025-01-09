"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface WorkspaceListClientProps {
  workspaces: {
    id: string;
    name: string;
    _count?: {
      members: number;
      channels: number;
    };
  }[];
}

export default function WorkspaceListClient({
  workspaces
}: WorkspaceListClientProps) {
  const { onOpen } = useModal();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="max-w-3xl w-full px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Welcome to Slack Clone</h2>
          <p className="text-muted-foreground mb-4">Select a workspace to get started or create a new one</p>
          <Button
            size="lg"
            onClick={() => onOpen("createWorkspace")}
            className="mb-8"
          >
            Create a Workspace
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <Card 
              key={workspace.id}
              className="cursor-pointer hover:shadow-md transition"
              onClick={() => router.push(`/workspaces/${workspace.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-x-2">
                  <div className="h-8 w-8 rounded-md bg-zinc-700/10 dark:bg-zinc-700 flex items-center justify-center">
                    <p className="font-semibold text-lg">
                      {workspace.name[0].toUpperCase()}
                    </p>
                  </div>
                  <span>{workspace.name}</span>
                </CardTitle>
                {workspace._count && (
                  <CardDescription>
                    {workspace._count.members} {workspace._count.members === 1 ? "member" : "members"} •{" "}
                    {workspace._count.channels} {workspace._count.channels === 1 ? "channel" : "channels"}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 