import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import ServerSidebar from "@/components/server/server-sidebar";
import { cn } from "@/lib/utils";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: { workspaceId: string };
}

export default async function WorkspaceLayout({
  children,
  params
}: WorkspaceLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const workspace = await db.workspace.findUnique({
    where: {
      id: params.workspaceId,
      members: {
        some: {
          userId
        }
      }
    }
  });

  if (!workspace) {
    redirect("/workspaces");
  }

  return (
    <>
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0 md:pl-[72px]">
        <ServerSidebar workspaceId={params.workspaceId} />
      </div>
      <main className={cn("h-full", "md:pl-60")}>
        {children}
      </main>
    </>
  );
} 