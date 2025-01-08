import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import NavigationSidebar from "@/components/navigation/navigation-sidebar";
import ServerSidebar from "@/components/server/server-sidebar";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

interface WorkspacesLayoutProps {
  children: React.ReactNode;
  params: { workspaceId: string };
}

export default async function WorkspacesLayout({
  children,
  params
}: WorkspacesLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // If we're at /workspaces root, check if user has any workspaces
  if (!params.workspaceId) {
    const workspaces = await db.workspace.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      take: 1
    });

    // If user has workspaces, redirect to the first one
    if (workspaces.length > 0) {
      redirect(`/workspaces/${workspaces[0].id}`);
    }
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <div className="md:pl-[72px] h-full">
        <div className="h-full flex">
          {params.workspaceId && (
            <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0 md:pl-[72px]">
              <ServerSidebar workspaceId={params.workspaceId} />
            </div>
          )}
          <main className={cn(
            "h-full w-full",
            params.workspaceId && "md:pl-60"
          )}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 