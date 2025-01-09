"use client";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReactionPickerProps {
  onEmojiSelect: (emoji: string) => void;
  children?: React.ReactNode;
}

export function ReactionPicker({
  onEmojiSelect,
  children
}: ReactionPickerProps) {
  const { theme } = useTheme();

  const handleEmojiSelect = (emoji: any) => {
    onEmojiSelect(emoji.native);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-accent"
          >
            <SmilePlus className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="start"
        className="w-full border-none p-0 shadow-xl"
      >
        <Picker
          data={data}
          onEmojiSelect={handleEmojiSelect}
          theme={theme === "dark" ? "dark" : "light"}
          previewPosition="none"
          skinTonePosition="none"
          searchPosition="none"
          navPosition="none"
          perLine={8}
          maxFrequentRows={1}
        />
      </PopoverContent>
    </Popover>
  );
} 