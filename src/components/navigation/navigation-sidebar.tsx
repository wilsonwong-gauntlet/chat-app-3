import { UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import WorkspaceItem from "./workspace-item";
import { Workspace } from "@/types";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { useModal } from "@/hooks/use-modal-store";

export default async function NavigationSidebar() {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  const workspaces = await db.workspace.findMany({
    where: {
      members: {
        some: {
          userId: profile.id
        }
      }
    }
  });

  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8] py-3">
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-[48px] w-[48px]"
          }
        }}
      />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="mb-4">
            <WorkspaceItem
              id={workspace.id}
              name={workspace.name}
              imageUrl={workspace.imageUrl}
            />
          </div>
        ))}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <Button
          size="icon"
          variant="outline"
          className="h-[48px] w-[48px]"
          onClick={() => useModal.getState().onOpen("createWorkspace")}
        >
          <Plus className="h-[25px] w-[25px]" />
        </Button>
      </div>
    </div>
  );
} 