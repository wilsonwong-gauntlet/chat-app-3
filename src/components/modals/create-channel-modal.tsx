"use client";

import * as React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string()
    .min(1, { message: "Channel name is required." })
    .max(32, { message: "Channel name cannot be longer than 32 characters." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Channel name can only contain lowercase letters, numbers, and hyphens."
    }),
  type: z.enum(["PUBLIC", "PRIVATE"], {
    required_error: "Channel type is required."
  }),
  description: z.string().optional()
});

export function CreateChannelModal() {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "PUBLIC",
      description: ""
    }
  });

  const isModalOpen = isOpen && type === "createChannel";

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      form.clearErrors();
      
      if (!data.workspaceId) {
        throw new Error("No workspace ID provided");
      }

      setIsLoading(true);
      const response = await fetch(`/api/workspaces/${data.workspaceId}/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          form.setError("name", {
            type: "manual",
            message: responseData.error
          });
          return;
        }
        throw new Error(responseData.error || "Failed to create channel");
      }
      
      // Reset form and close modal
      form.reset();
      onClose();
      
      // Navigate to the new channel
      router.push(`/workspaces/${data.workspaceId}/channels/${responseData.id}`);
    } catch (error) {
      console.error(error);
      form.setError("root", {
        type: "manual",
        message: error instanceof Error ? error.message : "Something went wrong"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.clearErrors();
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-2xl font-bold">Create a Channel</DialogTitle>
          <DialogDescription>
            Create a new channel in this workspace. Public channels can be joined by anyone, while private channels are invite-only.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="px-6 space-y-4">
              {form.formState.errors.root && (
                <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm flex items-center gap-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <p>{form.formState.errors.root.message}</p>
                </div>
              )}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          disabled={isLoading}
                          placeholder="e.g. marketing"
                          className={form.formState.errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                          {...field}
                        />
                        {form.formState.errors.name && (
                          <AlertCircle className="h-4 w-4 text-destructive absolute right-3 top-3" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel Type</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="What's this channel about?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="px-6 py-4">
              <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 