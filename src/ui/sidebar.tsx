

// src/components/sidebar.tsx
// Changes: Added app-specific menu items for budgeting features (dashboard, transactions, etc.).
// Integrated with useBudget for user-dependent items (e.g., login/profile).
// Added React Router links for navigation (assume installed; aligns with tech stack).
// No UI changes; just added content to SidebarMenu for comprehensive functionality.
// Ensured collapsible logic ties into mobile/desktop, with toggle handling state.

"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";

import { useIsMobile } from "../hooks/use_mobile";
import { cn } from "../utils/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { Skeleton } from "./skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Link } from "react-router-dom"; // Added for navigation logic (part of tech stack)
import { useBudget } from "../context/budget_context"; // Integrated for user state

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-[--sidebar-width] flex-col border-r px-2 py-4",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} modal={false}>
        <SheetContent
          data-mobile="true"
          data-slot="sidebar"
          className={cn(
            "bg-sidebar text-sidebar-foreground w-[--sidebar-width-mobile] px-0 py-0 [&>button]:hidden",
            className,
          )}
          side={side}
          {...props}
        >
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      data-collapsible={state}
      data-variant={variant}
      data-slot="sidebar"
      className={cn(
        "bg-sidebar text-sidebar-foreground group relative h-full min-h-svh w-[--sidebar-width] flex-col border-r px-2 py-4 transition-[width] duration-300 ease-in-out",
        variant === "floating" && "absolute z-50",
        variant === "inset" && "px-0 py-2",
        (state === "collapsed" || collapsible === "icon") && "px-0 w-[--sidebar-width-icon]",
        side === "right" && "border-l border-r-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ... (The rest of the original subcomponents remain unchanged: SidebarContent, SidebarFooter, SidebarGroup, etc.)

// Added app-specific logic: Define the menu items for budgeting navigation.
function SidebarMenu({ ...props }: React.ComponentProps<"ul">) {
  const { state } = useSidebar();
  const { state: budgetState } = useBudget(); // Integrated for user logic
  const user = budgetState.user;

  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex flex-col gap-0.5", props.className)}
      {...props}
    >
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/dashboard">Dashboard</Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/transactions">Transactions</Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/reports">Reports</Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/goals">Goals</Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/login">{user ? `Profile (${user.name})` : "Login"}</Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {state === "collapsed" && <Separator className="my-2" />}
      {/* Add more items if needed for categories or settings */}
    </ul>
  );
}

// ... (Rest of original code for SidebarMenuAction, SidebarMenuBadge, etc., unchanged)

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu, // Now with added app logic
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};

export default SIDEBAR_COOKIE_NAME;


export { SIDEBAR_COOKIE_NAME };

export { SIDEBAR_COOKIE_NAME };
