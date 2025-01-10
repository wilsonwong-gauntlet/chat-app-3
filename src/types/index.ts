import type { Channel, User, Message, Workspace, WorkspaceMember, ChannelMember } from ".prisma/client";

export type { Channel, User, Message, Workspace, WorkspaceMember, ChannelMember };

export interface WorkspaceWithRelations extends Workspace {
  members: (WorkspaceMember & {
    user: {
      id: string;
      name: string;
      email: string;
      imageUrl: string | null;
    }
  })[];
  channels: (Channel & {
    members: (ChannelMember & {
      user: {
        id: string;
        name: string;
        imageUrl: string | null;
      }
    })[];
  })[];
}

export interface MessageWithUser extends Message {
  user: User;
  channel: Channel;
  replies?: MessageWithUser[];
  _count?: {
    replies: number;
  }
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string | null;
}

export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  type: ChannelType;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ChannelType {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  DIRECT = "DIRECT"
}

export interface Message {
  id: string;
  content: string;
  fileUrl?: string | null;
  channelId: string;
  userId: string;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  _count?: {
    replies: number;
  };
} 