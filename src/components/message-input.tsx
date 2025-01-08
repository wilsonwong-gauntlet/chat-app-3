import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
  isLoading?: boolean;
}

interface FormData {
  message: string;
}

export function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    if (data.message.trim()) {
      onSend(data.message);
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-24 border-t border-gray-200 dark:border-gray-800 p-4">
      <div className="relative h-full">
        <Textarea
          {...register("message")}
          placeholder="Type a message..."
          className="w-full h-full resize-none rounded-lg bg-background"
          disabled={isLoading}
        />
        <Button 
          size="sm"
          type="submit"
          disabled={isLoading}
          className="absolute right-3 bottom-3"
        >
          <SendHorizontal className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
    </form>
  );
} 