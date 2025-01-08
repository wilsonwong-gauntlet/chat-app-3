import { Hash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function NavigationSidebar() {
  // TODO: Fetch channels from API
  const channels = [
    { id: 1, name: "general" },
    { id: 2, name: "random" },
    { id: 3, name: "introductions" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Channels Header */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-200">Channels</h2>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Channels List */}
      <ScrollArea className="flex-1 px-1">
        <div className="space-y-1 p-2">
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant="ghost"
              className="w-full justify-start font-normal"
            >
              <Hash className="mr-2 h-4 w-4" />
              {channel.name}
            </Button>
          ))}
        </div>
      </ScrollArea>

      <Separator className="my-2 bg-gray-800" />
    </div>
  );
} 