"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "~/utils/styling";
import CloseIcon from "~/assets/close.svg";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const OVERLAY_STYLES =
  "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in";

const DialogPortal = ({ className, children, ...props }: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal className={cn(className)} {...props}>
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">{children}</div>
  </DialogPrimitive.Portal>
);
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={cn(OVERLAY_STYLES, className)} {...props} />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    allowScroll?: boolean;
    hideClose?: boolean;
  }
>(({ className, allowScroll, hideClose, children, ...props }, ref) => (
  <DialogPortal>
    {allowScroll ? <div className={OVERLAY_STYLES} /> : <DialogOverlay />}
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed top-[50%] z-50 grid w-full max-w-[calc(100vw-2rem)] translate-y-[-50%] gap-4 rounded-lg border border-gray-600 bg-gray-800 p-6 shadow-lg animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 xs:max-w-sm sm:zoom-in-90 data-[state=open]:sm:slide-in-from-bottom-0",
        className
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <div className="absolute right-4 top-4">
          <DialogClose />
        </div>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

function DialogClose() {
  return (
    <DialogPrimitive.Close className="-mr-1 -mt-1 rounded-sm p-1 opacity-70 ring-offset-8 transition-opacity hover:bg-gray-700 hover:opacity-100 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:pointer-events-none">
      <CloseIcon className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  );
}

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-medium leading-7 tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm leading-6 text-gray-200", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
