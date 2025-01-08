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