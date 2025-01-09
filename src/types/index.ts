import { Message, User, Channel as PrismaChannel, Workspace as PrismaWorkspace, WorkspaceMember, ChannelMember } from "@prisma/client";

export interface WorkspaceWithRelations extends PrismaWorkspace {
  members: (WorkspaceMember & {
    user: {
      id: string;
      name: string;
      email: string;
      imageUrl: string | null;
    }
  })[];
  channels: (PrismaChannel & {
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
  channel: PrismaChannel;
  replies?: MessageWithUser[];
  _count?: {
    replies: number;
  }
} 