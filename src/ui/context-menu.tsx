

// src/components/context-menu.tsx
// Changes: Added app-specific items (e.g., edit/delete transaction). 
// Integrated with dispatch for actions.

"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "../utils/utils";
import { useBudget } from "../context/budget_context"; // For dispatch
import { toast } from "sonner"; // For notifications

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

// ... (ContextMenuTrigger, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuRadioGroup unchanged)

function ContextMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  const { dispatch } = useBudget();

  return (
    <ContextMenuPortal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      >
        <ContextMenuItem onSelect={() => {
          // Open edit form/sheet
          toast.info("Edit Item");
        }}>Edit</ContextMenuItem>
        <ContextMenuItem onSelect={(id) => {
          dispatch({ type: "DELETE_TRANSACTION", payload: id }); // Assume id from context
          toast.success("Deleted");
        }}>Delete</ContextMenuItem>
        {/* Add more, e.g., "View Details" */}
      </ContextMenuPrimitive.Content>
    </ContextMenuPortal>
  );
}

// ... (Rest of original code unchanged)

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent, // Updated with logic
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};

export default ContextMenu;

export { ContextMenu };
