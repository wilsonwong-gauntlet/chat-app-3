import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import ServerSidebar from "@/components/server/server-sidebar";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0 left-[72px]">
        <ServerSidebar workspaceId={params.workspaceId} />
      </div>
      <main className="h-full md:pl-60">
        {children}
      </main>
    </div>
  );
} 