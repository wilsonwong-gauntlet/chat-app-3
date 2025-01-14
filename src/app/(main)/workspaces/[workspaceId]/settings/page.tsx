import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { WorkspaceNameForm } from "@/components/workspace/workspace-name-form";
import { AddMemberForm } from "@/components/workspace/add-member-form";
import { DeleteWorkspaceButton } from "@/components/workspace/delete-workspace-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldQuestion,
  Settings,
  Users
} from "lucide-react";

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
      },
      _count: {
        select: {
          channels: true
        }
      }
    }
  });

  if (!workspace) {
    return null;
  }

  // Check if user is a member and an admin
  const member = workspace.members.find(
    (member) => member.user.clerkId === userId
  );

  if (!member) {
    return null;
  }

  return {
    ...workspace,
    isAdmin: member.role === Role.ADMIN
  };
}

// Get display name, handle empty/null cases
function getDisplayName(member: any) {
  if (!member?.user) return "Anonymous User";
  return member.user.name || member.user.email?.split('@')[0] || "Anonymous User";
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

  // Decode the workspace ID from the URL
  const decodedWorkspaceId = decodeURIComponent(params.workspaceId);
  const workspace = await getWorkspace(decodedWorkspaceId, userId);

  if (!workspace) {
    redirect("/workspaces");
  }

  // Only admins can access settings
  if (!workspace.isAdmin) {
    redirect(`/workspaces/${decodedWorkspaceId}`);
  }

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      case Role.MEMBER:
        return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
      case Role.GUEST:
        return <ShieldQuestion className="h-4 w-4 text-blue-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Workspace Settings</h1>
        </div>
      </div>
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* General Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">General</h2>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <WorkspaceNameForm
                workspaceId={workspace.id}
                initialName={workspace.name}
              />
            </div>
          </div>

          {/* Members Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Members</h2>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {workspace.members.length} {workspace.members.length === 1 ? 'member' : 'members'}
                </p>
              </div>
            </div>
            <div className="p-6 rounded-lg border bg-card space-y-6">
              <AddMemberForm workspaceId={workspace.id} />
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Current Members</h3>
                <div className="space-y-2">
                  {workspace.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-accent"
                    >
                      <div className="flex items-center gap-x-2">
                        <img
                          src={member.user.imageUrl || "/placeholder-avatar.png"}
                          alt={getDisplayName(member)}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium">{getDisplayName(member)}</p>
                          <p className="text-xs text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center gap-2">
                              {getRoleBadge(member.role)}
                              <span className="text-xs">{member.role}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {member.role === Role.ADMIN ? "Can manage workspace settings and members" :
                             member.role === Role.MEMBER ? "Can participate in all channels" :
                             "Limited access to specific channels"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
            <div className="p-6 rounded-lg border border-destructive/20 bg-destructive/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Delete Workspace</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete {workspace.name} and all of its data
                  </p>
                </div>
                <DeleteWorkspaceButton
                  workspaceId={workspace.id}
                  workspaceName={workspace.name}
                  channelCount={workspace._count.channels}
                  memberCount={workspace.members.length}
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
} 