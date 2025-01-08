import { UserButton } from "@clerk/nextjs";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { NavigationSidebar } from "./navigation-sidebar";

export default function Sidebar() {
  return (
    <div className="hidden md:flex h-full w-60 z-30 flex-col fixed inset-y-0">
      <div className="flex flex-col h-full bg-gray-900 text-primary-foreground">
        {/* Top section with user profile */}
        <div className="p-3 flex items-center justify-between border-b border-gray-800">
          <WorkspaceSwitcher />
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
        
        {/* Navigation section */}
        <NavigationSidebar />
      </div>
    </div>
  );
} 