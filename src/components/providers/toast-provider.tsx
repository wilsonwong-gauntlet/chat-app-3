"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider as Provider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import type { ToastActionElement } from "@/components/ui/toast";

interface ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  [key: string]: any;
}

export function ToastProvider() {
  const { toasts } = useToast();

  return (
    <Provider>
      {toasts.map(function ({ id, title, description, action, ...props }: ToastProps) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </Provider>
  );
} 