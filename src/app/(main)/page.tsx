import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

export default async function MainPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user's workspaces
  const workspaces = await db.workspace.findMany({
    where: {
      members: {
        some: {
          userId
        }
      }
    },
    include: {
      members: true
    },
    take: 1
  });

  // If user has no workspaces, show empty state
  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Welcome to Slack Clone</h2>
        <p className="text-slate-500 mb-4">Get started by creating or joining a workspace</p>
      </div>
    );
  }

  // Redirect to the first workspace's general channel
  const workspace = workspaces[0];
  const generalChannel = await db.channel.findFirst({
    where: {
      workspaceId: workspace.id,
      name: "general"
    }
  });

  if (generalChannel) {
    redirect(`/workspaces/${workspace.id}/channels/${generalChannel.id}`);
  }

  // If no general channel exists, show workspace view
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold mb-4">Welcome to {workspace.name}</h2>
      <p className="text-slate-500">No channels available</p>
    </div>
  );
} 