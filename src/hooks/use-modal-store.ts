import { Channel, ChannelMember, User } from "@/types";
import { create } from "zustand";

export type ModalType = "createChannel" | "members" | "startDM" | "createWorkspace" | "channelDetails" | "addPeople";

interface ModalData {
  channel?: Channel & {
    members: (ChannelMember & {
      user: {
        id: string;
        name: string;
        email: string;
        imageUrl: string | null;
        clerkId: string;
      };
    })[];
  };
  workspaceId?: string;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false, data: {} })
})); 