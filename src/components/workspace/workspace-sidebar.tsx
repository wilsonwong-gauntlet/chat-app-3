import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Hash, Settings } from "lucide-react";

async function getWorkspaceData(workspaceId: string, userId: string) {
  const workspace = await db.workspace.findUnique({
    where: {
      id: workspaceId,
      members: {
        some: {
          user: {
            clerkId: userId
          }
        }
      }
    },
    include: {
      channels: {
        where: {
          type: "PUBLIC",
          OR: [
            {
              members: {
                some: {
                  user: {
                    clerkId: userId
                  }
                }
              }
            }
          ]
        },
        orderBy: {
          createdAt: "asc"
        }
      },
      members: {
        include: {
          user: true
        },
        orderBy: {
          role: "asc"
        }
      }
    }
  });

  return workspace;
}

export async function WorkspaceSidebar({
  workspaceId
}: {
  workspaceId: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const workspace = await getWorkspaceData(workspaceId, userId);

  if (!workspace) {
    redirect("/workspaces");
  }

  const isAdmin = workspace.members.some(
    member => member.user.clerkId === userId && member.role === "ADMIN"
  );

  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">
            {workspace.name}
          </h2>
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              asChild
            >
              <Link href={`/workspaces/${workspaceId}/settings`}>
                <Settings className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <div className="mb-2">
            <h3 className="text-sm font-semibold">Channels</h3>
          </div>
          <div className="space-y-[2px]">
            {workspace.channels.map((channel) => (
              <Button
                key={channel.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start px-2"
                asChild
              >
                <Link href={`/workspaces/${workspaceId}/channels/${channel.id}`}>
                  <Hash className="w-4 h-4 mr-2" />
                  {channel.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
} 