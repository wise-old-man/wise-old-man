"use client";

import { useToast } from "~/hooks/useToast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "./Toast";

import CheckIcon from "~/assets/check.svg";
import CloseIcon from "~/assets/close.svg";
import WarningIcon from "~/assets/warning.svg";

export function ToastManager() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, variant, action, ...props }) {
        return (
          <Toast key={id} {...props} className="mb-2">
            <div className="flex gap-x-2">
              {variant === "success" && (
                <CheckIcon className="-ml-2 mt-px h-5 w-5 shrink-0 rounded-full text-green-400" />
              )}
              {variant === "error" && (
                <CloseIcon className="-ml-2 mt-px h-5 w-5 shrink-0 rounded-full text-red-400" />
              )}
              {variant === "warning" && (
                <WarningIcon className="-ml-2 mt-px h-5 w-5 shrink-0 rounded-full text-yellow-400" />
              )}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action && <div className="pr-2">{action}</div>}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
