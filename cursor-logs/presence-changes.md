# Presence Feature Changes Analysis

## Root Cause Found
The issue is in the workspace page structure. The sidebar needs to be rendered alongside the page content, not inside it.

### Current Structure
```tsx
// [workspaceId]/layout.tsx
return (
  <WorkspaceProvider>
    <PresenceProvider>
      {children}
    </PresenceProvider>
  </WorkspaceProvider>
);

// [workspaceId]/page.tsx
return (
  <div className="h-full p-4">
    <h1>Welcome to {workspace.name}</h1>
    ...
  </div>
);
```

### Required Structure
```tsx
// [workspaceId]/layout.tsx
return (
  <WorkspaceProvider>
    <PresenceProvider>
      <div className="h-full flex">
        <WorkspaceSidebarServer workspaceId={workspaceId} />
        <main className="flex-1 h-full">
          {children}
        </main>
      </div>
    </PresenceProvider>
  </WorkspaceProvider>
);

// [workspaceId]/page.tsx - remains the same
return (
  <div className="h-full p-4">
    <h1>Welcome to {workspace.name}</h1>
    ...
  </div>
);
```

## Solution Steps
1. Move the layout wrapper from page to layout component
2. Keep the sidebar at the layout level
3. Ensure proper flex container for sidebar and main content

## Modified Files Overview
1. prisma/schema.prisma
2. src/app/(main)/workspaces/[workspaceId]/layout.tsx
3. src/components/user-avatar.tsx
4. src/components/workspace/channels-list.tsx
5. src/components/workspace/direct-messages-list.tsx
6. src/components/workspace/workspace-sidebar.tsx
7. src/types/index.ts

## Changes Analysis

### 1. prisma/schema.prisma
```diff
+ // Presence fields
+ status        String?   // Custom status message
+ presence      PresenceStatus  @default(OFFLINE)
+ lastSeen      DateTime  @default(now())
+ isActive      Boolean   @default(false)
```
**Layout Impact**: None - Database schema changes only affect data structure, not UI layout

### 2. src/app/(main)/workspaces/[workspaceId]/layout.tsx
```diff
+ import { PresenceProvider } from "@/providers/presence-provider";
+ import { WorkspaceSidebarServer } from "@/components/workspace/workspace-sidebar-server";

  return (
    <WorkspaceProvider>
      <PresenceProvider>
        <div className="h-full flex">
          <WorkspaceSidebarServer workspaceId={workspaceId} />
          <main className="flex-1 h-full">
            {children}
          </main>
        </div>
      </PresenceProvider>
    </WorkspaceProvider>
  );
```
**Layout Impact**: Critical - This is where the layout structure should be defined

### 3. src/components/workspace/workspace-sidebar.tsx
```diff
- import { User, Channel, ChannelMember, WorkspaceWithRelations } from "@/types";
+ import { User, Channel, ChannelMember } from "@/types";

interface WorkspaceSidebarProps {
-  channels: (Channel & {
-    members: (ChannelMember & {
-      user: User;
-    })[];
-  })[];
+  channels: Channel[];
   members: {
     user: User;
   }[];
-  availableWorkspaces: {...}
}

+ const { onlineUsers } = usePresence();
+ const currentUserPresence = onlineUsers[user.id]?.presence || "OFFLINE";
+ const currentUserStatus = onlineUsers[user.id]?.status;
```
**Layout Impact**: None - Type changes and presence state only

### 4. src/components/user-avatar.tsx
```diff
+ import { usePresence } from "@/providers/presence-provider";
+ const { onlineUsers } = usePresence();
+ const presence = onlineUsers[userId]?.presence || "OFFLINE";
```
**Layout Impact**: None - Only adds presence indicator to existing avatar component

### 5. src/components/workspace/channels-list.tsx & direct-messages-list.tsx
```diff
- type: channel.type === ChannelType.PUBLIC
+ type: channel.type as ChannelType
```
**Layout Impact**: None - Type casting changes only

## Next Steps
1. Revert layout.tsx to include the proper structure
2. Keep all other presence-related changes
3. Test the layout with different viewport sizes 