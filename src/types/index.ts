import { Prisma } from "@prisma/client";

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
}

interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: "PUBLIC" | "PRIVATE" | "DIRECT";
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChannelMember {
  id: string;
  channelId: string;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkspaceMember {
  id: string;
  role: "ADMIN" | "MEMBER" | "GUEST";
  userId: string;
  workspaceId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceWithRelations {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  members: WorkspaceMember[];
  channels: (Channel & {
    members: ChannelMember[];
  })[];
}

export interface MessageWithUser {
  id: string;
  content: string;
  fileUrl: string | null;
  channelId: string;
  userId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  channel: Channel;
  replies?: MessageWithUser[];
  _count?: {
    replies: number;
  }
} 