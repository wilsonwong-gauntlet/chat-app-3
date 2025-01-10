"use client";

import * as React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AlertCircle, Trash2 } from "lucide-react";

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
import { useWorkspace } from "@/providers/workspace-provider";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChannelMemberOptions } from "@/components/workspace/channel-member-options";
import { Channel, ChannelType } from "@/types";
import { AddChannelMemberForm } from "@/components/workspace/add-channel-member-form";

const formSchema = z.object({
  name: z.string()
    .min(1, { message: "Channel name is required." })
    .max(32, { message: "Channel name cannot be longer than 32 characters." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Channel name can only contain lowercase letters, numbers, and hyphens."
    }),
  type: z.enum(["PUBLIC", "PRIVATE"] as const, {
    required_error: "Channel type is required."
  }),
  description: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export function ChannelSettingsModal() {
  const { isOpen, onClose, type, data } = useModal();
  const { refresh } = useWorkspace();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const isModalOpen = isOpen && type === "channelSettings";
  const channel = data.channel as Channel;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: channel?.name || "",
      type: (channel?.type === ChannelType.PUBLIC ? "PUBLIC" : "PRIVATE") || "PUBLIC",
      description: channel?.description || ""
    }
  });

  React.useEffect(() => {
    if (channel) {
      form.reset({
        name: channel.name,
        type: channel.type === ChannelType.PUBLIC ? "PUBLIC" : "PRIVATE",
        description: channel.description || ""
      });
    }
  }, [channel, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      form.clearErrors();
      setIsLoading(true);

      const response = await fetch(`/api/channels/${channel.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          type: values.type === "PUBLIC" ? ChannelType.PUBLIC : ChannelType.PRIVATE
        }),
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
        throw new Error(responseData.error || "Failed to update channel");
      }

      // Refresh workspace data and close modal
      await refresh();
      onClose();
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

  const onDelete = async () => {
    try {
      setDeleteLoading(true);

      const response = await fetch(`/api/channels/${channel.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete channel");
      }

      // Refresh workspace data and redirect to workspace home
      await refresh();
      onClose();
      router.push(`/workspaces/${channel.workspaceId}`);
    } catch (error) {
      console.error(error);
      form.setError("root", {
        type: "manual",
        message: error instanceof Error ? error.message : "Something went wrong"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClose = () => {
    form.clearErrors();
    form.reset();
    onClose();
  };

  if (!channel) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-2xl font-bold">Channel Settings</DialogTitle>
          <DialogDescription>
            Update channel settings or manage members. Changes will be visible to all members.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="px-6">
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
                          disabled={isLoading || channel.name === "general"}
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
                      disabled={isLoading || channel.name === "general"}
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
            <Separator />
            <div className="px-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Channel Members</h3>
                <p className="text-sm text-muted-foreground">
                  Manage who has access to this channel.
                </p>
              </div>
              {channel.name !== "general" && (
                <AddChannelMemberForm channelId={channel.id} />
              )}
              <ScrollArea className="h-[200px] pr-6">
                <div className="space-y-4">
                  {channel.members?.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-x-2">
                        <img
                          src={member.user.imageUrl || "/placeholder-avatar.png"}
                          alt={member.user.name}
                          className="h-8 w-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {member.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                      {channel.name !== "general" && (
                        <ChannelMemberOptions
                          channelId={channel.id}
                          memberId={member.userId}
                          isCurrentUser={false}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <Separator />
            <div className="px-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this channel and all its messages.
                </p>
              </div>
              {channel.name !== "general" && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleteLoading}
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Channel
                </Button>
              )}
            </div>
            <DialogFooter className="px-6 py-4">
              <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 