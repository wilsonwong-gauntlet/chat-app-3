import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { WorkspaceNameForm } from "@/components/workspace/workspace-name-form";
import { AddMemberForm } from "@/components/workspace/add-member-form";
import { MemberOptions } from "@/components/workspace/member-options";

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
            <div className="space-y-4">
              <AddMemberForm workspaceId={workspace.id} />
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Current Members</h4>
                <div className="space-y-2">
                  {workspace.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-md bg-zinc-100 dark:bg-zinc-800"
                    >
                      <div className="flex items-center gap-x-2">
                        <img
                          src={member.user.imageUrl || "/placeholder-avatar.png"}
                          alt={member.user.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium">{member.user.name}</p>
                          <p className="text-xs text-zinc-500">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-200 dark:bg-zinc-700">
                          {member.role}
                        </span>
                        <MemberOptions
                          workspaceId={workspace.id}
                          memberId={member.id}
                          memberRole={member.role}
                          isCurrentUser={member.user.clerkId === userId}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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