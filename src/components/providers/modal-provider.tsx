"use client";

import { useEffect, useState } from "react";

import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { CreateDMModal } from "@/components/modals/create-dm-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateWorkspaceModal />
      <CreateChannelModal />
      <CreateDMModal />
    </>
  );
} 