import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const workspaces = await db.workspace.findMany({
    where: {
      members: {
        some: {
          userId: userId
        }
      }
    },
    select: {
      id: true,
      name: true,
    }
  });

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar workspaces={workspaces} />
      </div>
      <main className="md:pl-[72px] h-full">
        {children}
      </main>
    </div>
  );
} 