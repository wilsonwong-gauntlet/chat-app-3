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