"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address."
  })
});

interface AddMemberFormProps {
  workspaceId: string;
}

export function AddMemberForm({
  workspaceId
}: AddMemberFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 && data.error === "User not found") {
          form.setError("email", {
            type: "manual",
            message: "No user found with this email. They need to sign up first."
          });
          return;
        }
        throw new Error(data.error || "Failed to add member");
      }

      toast.success("Member added successfully");
      form.reset();
      router.refresh();
    } catch (error) {
      console.error("[ADD_MEMBER_ERROR]", error);
      if (error instanceof Error) {
        form.setError("email", {
          type: "manual",
          message: error.message
        });
      } else {
        form.setError("email", {
          type: "manual",
          message: "Something went wrong. Please try again."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <div className="flex items-center gap-x-2">
                  <div className="relative flex-1">
                    <Input
                      {...field}
                      disabled={isLoading}
                      placeholder="Enter member's email"
                      type="email"
                    />
                    <div className="absolute right-3 top-2.5 text-muted-foreground">
                      <UserPlus className="h-4 w-4" />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    Add Member
                  </Button>
                </div>
              </FormControl>
              {/* <FormDescription>
                The user must have an account before they can be added to the workspace.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
} 