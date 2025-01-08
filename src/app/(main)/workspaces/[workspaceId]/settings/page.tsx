import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { WorkspaceNameForm } from "@/components/workspace/workspace-name-form";

async function getWorkspace(workspaceId: string, userId: string) {
  const workspace = await db.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    include: {
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

  if (!workspace) {
    return null;
  }

  // Check if user is a member
  const member = workspace.members.find(member => member.user.clerkId === userId);
  if (!member) {
    return null;
  }

  return {
    ...workspace,
    isAdmin: member.role === "ADMIN"
  };
}

export default async function WorkspaceSettingsPage({
  params
}: {
  params: { workspaceId: string }
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const workspace = await getWorkspace(params.workspaceId, userId);

  if (!workspace) {
    redirect("/workspaces");
  }

  // Only admins can access settings
  if (!workspace.isAdmin) {
    redirect(`/workspaces/${params.workspaceId}`);
  }

  return (
    <div className="h-full p-4 space-y-2">
      <h2 className="text-2xl font-bold">Workspace Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border">
            <h3 className="text-xl font-semibold mb-4">General</h3>
            <WorkspaceNameForm
              workspaceId={workspace.id}
              initialName={workspace.name}
            />
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border">
            <h3 className="text-xl font-semibold mb-4">Members</h3>
            {/* Member list and management will go here */}
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-white dark:bg-zinc-900 border">
            <h3 className="text-xl font-semibold mb-4 text-rose-500">Danger Zone</h3>
            {/* Delete workspace button will go here */}
          </div>
        </div>
      </div>
    </div>
  );
} 