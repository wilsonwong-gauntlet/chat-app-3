import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { WorkspaceProvider } from "@/providers/workspace-provider";
import { WorkspaceSidebarClient } from "@/components/workspace/workspace-sidebar-client";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: { workspaceId: string }
}

export default async function WorkspaceLayout({
  children,
  params
}: WorkspaceLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <WorkspaceProvider>
      <div className="flex h-full">
        <div className="hidden md:flex w-60 z-20 flex-col fixed inset-y-0 left-[72px]">
          <WorkspaceSidebarClient />
        </div>
        <main className="flex-1 h-full pl-60">
          {children}
        </main>
      </div>
    </WorkspaceProvider>
  );
} 