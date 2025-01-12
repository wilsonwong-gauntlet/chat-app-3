"use client";

import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export function UserButtonWrapper() {
  const pathname = usePathname();
  const isInWorkspace = pathname?.includes("/workspaces/");
  
  if (isInWorkspace) return null;
  
  return (
    <div className="fixed bottom-8 left-8 z-50">
      <UserButton 
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-10 w-10",
            rootBox: "hover:opacity-80 transition-opacity"
          }
        }}
      />
    </div>
  );
} 