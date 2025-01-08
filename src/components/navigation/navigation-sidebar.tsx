import { UserButton } from "@clerk/nextjs";

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import WorkspaceItem from "./workspace-item";
import { NavigationAction } from "./navigation-action";
import { db } from "@/lib/db";

interface NavigationSidebarProps {
  userId: string;
}

export default async function NavigationSidebar({
  userId
}: NavigationSidebarProps) {
  const workspaces = await db.workspace.findMany({
    where: {
      members: {
        some: {
          userId: userId
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
      <NavigationAction />
    </div>
  );
} 