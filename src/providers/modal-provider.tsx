"use client";

import * as React from "react";

import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { ChannelSettingsModal } from "@/components/modals/channel-settings-modal";

export function ModalProvider() {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateWorkspaceModal />
      <CreateChannelModal />
      <ChannelSettingsModal />
    </>
  );
} 