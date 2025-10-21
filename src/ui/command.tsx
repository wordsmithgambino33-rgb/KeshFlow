

// src/components/command.tsx
// Changes: Added app-specific commands (e.g., add transaction, toggle theme, navigate).
// Integrated with useBudget dispatch and React Router. Commands trigger actions/forms.

"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";

import { cn } from "../utils/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { useBudget } from "../context/budget-context"; // For actions
import { useTheme } from "next-themes"; // For theme toggle
import { useNavigate } from "react-router-dom"; // For navigation
import { toast } from "sonner";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// ... (CommandInput, CommandList, CommandEmpty unchanged)

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  const { dispatch } = useBudget();
  const { setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    >
      <CommandItem onSelect={() => navigate("/dashboard")}>Go to Dashboard</CommandItem>
      <CommandItem onSelect={() => {
        // Trigger add transaction logic, e.g., open sheet/form
        toast.info("Open Add Transaction Form");
      }}>Add Transaction</CommandItem>
      <CommandItem onSelect={() => setTheme("dark")}>Toggle Dark Mode</CommandItem>
      <CommandItem onSelect={() => dispatch({ type: "LOGOUT" })}>Logout</CommandItem>
      {/* Add more app commands, e.g., "View Reports", "Add Goal" */}
    </CommandPrimitive.Group>
  );
}

// ... (Rest of original code unchanged: CommandSeparator, CommandItem, CommandShortcut)

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup, // Updated with logic
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};

export default Command;

export { Command };
