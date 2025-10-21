

// src/components/menubar.tsx
// Changes: Added app-specific menu items in MenubarContent for budgeting features.
// Integrated with useBudget for user state. Used for top menu bar with sub-items (e.g., under Transactions: Add New).
// No UI changes; populated for comprehensive navigation logic.

"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "../utils/utils";
import { Link } from "react-router-dom"; // For links
import { useBudget } from "../context/budget_context"; // For user

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

// ... (MenubarGroup, MenubarPortal, MenubarRadioGroup, MenubarTrigger unchanged)

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  const { state } = useBudget();
  const user = state.user;

  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      >
        {/* App-specific content */}
        <MenubarItem>
          <Link to="/dashboard">Dashboard</Link>
        </MenubarItem>
        <MenubarSub>
          <MenubarSubTrigger>Transactions</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem>
              <Link to="/transactions">View All</Link>
            </MenubarItem>
            <MenubarItem>Add New</MenubarItem> {/* Trigger form sheet */}
          </MenubarSubContent>
        </MenubarSub>
        <MenubarItem>
          <Link to="/reports">Reports</Link>
        </MenubarItem>
        <MenubarItem>
          <Link to="/goals">Goals</Link>
        </MenubarItem>
        <MenubarItem>
          <Link to="/login">{user ? "Profile" : "Login"}</Link>
        </MenubarItem>
      </MenubarPrimitive.Content>
    </MenubarPortal>
  );
}

// ... (Rest of original code unchanged: MenubarLabel, MenubarItem, etc.)

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent, // Updated with app logic
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};

export default Menubar;

export { Menubar };
