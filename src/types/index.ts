export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string | null;
  status?: string | null;
  presence?: PresenceStatus;
  lastSeen?: Date;
  isActive?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  type: ChannelType;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  members?: ChannelMember[];
  workspace?: Workspace;
  otherUser?: User;
}

export interface ChannelMember {
  id: string;
  userId: string;
  channelId: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface Workspace {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  members: WorkspaceMember[];
  channels: Channel[];
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: MemberRole;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export enum ChannelType {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  DIRECT = "DIRECT"
}

export enum MemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  GUEST = "GUEST"
}

export interface Message {
  id: string;
  content: string;
  fileUrl?: string | null;
  channelId: string;
  userId: string;
  parentId?: string | null;
  isAIResponse?: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  channel: Channel;
  replies?: Message[];
  _count?: {
    replies: number;
  };
}

export type MessageWithUser = Message & {
  user: User;
  replies?: MessageWithUser[];
};

export interface WorkspaceWithRelations extends Workspace {
  members: (WorkspaceMember & {
    user: User;
  })[];
  channels: (Channel & {
    members: (ChannelMember & {
      user: User;
    })[];
  })[];
}

export enum PresenceStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  AWAY = "AWAY",
  DND = "DND"
}

export interface RAGMessageEvent {
  id: string;
  content: string;
  channelId: string;
  workspaceId: string;
  userId: string;
  userName: string;
  channelName: string;
  createdAt: Date;
}

export interface SearchQuery {
  query: string;
  workspaceId: string;
  receiverId: string;
  limit: number;
}

export interface GenerateRequest {
  query: string;
  workspaceId: string;
  receiverId: string;
  limit: number;
}

export interface SearchResult {
  content: string;
  messageId: string;
}

export interface AIResponse {
  response: string;
  confidence: number;
  sourceMessages: SearchResult[];
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  workspaceId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  workspace?: Workspace;
}

export type SupportedFileType = 
  | "text/plain"
  | "text/markdown"
  | "application/json"
  | "application/pdf"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export interface DocumentProcessRequest {
  documentId: string;        // UUID from our database
  fileUrl: string;          // S3 URL of the uploaded file
  workspaceId: string;      // UUID of the workspace for context
  fileName: string;         // Original file name with extension
  fileType: SupportedFileType; // MIME type of the document
}