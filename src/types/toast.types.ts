
import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { toastVariants } from "@/components/ui/toast";

// Basic toast properties
export interface ToastProps extends VariantProps<typeof toastVariants> {
  className?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Action element type
export type ToastActionElement = React.ReactElement;

// Extended toast type used in the toast system
export interface AppToast extends ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
}

// Parameters for the toast function
export type ToastFnProps = Omit<AppToast, "id" | "open" | "onOpenChange">;
