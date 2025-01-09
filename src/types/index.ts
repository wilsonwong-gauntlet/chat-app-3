import { Message, User, Channel as PrismaChannel } from "@prisma/client";

export interface Workspace {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  type: "TEXT" | "AUDIO" | "VIDEO";
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageWithUser extends Message {
  user: User;
  channel: PrismaChannel;
  replies?: MessageWithUser[];
  _count?: {
    replies: number;
  }
} 