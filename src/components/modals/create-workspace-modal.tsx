"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Workspace name is required."
  })
});

export function CreateWorkspaceModal() {
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      router.push(`/workspaces/${data.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen || type !== "createWorkspace") return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1D1E] border-0 text-white p-0">
        <DialogTitle className="text-2xl p-6">Create Workspace</DialogTitle>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-6">
          <div className="space-y-8">
            <Input
              placeholder="Workspace name"
              {...form.register("name")}
              className="bg-transparent border-zinc-700 text-white"
            />
          </div>
          <div className="flex justify-end pb-6">
            <Button 
              type="submit"
              className="bg-white text-black hover:bg-zinc-200 rounded-md px-6"
            >
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 