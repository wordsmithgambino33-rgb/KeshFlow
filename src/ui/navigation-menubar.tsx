

// src/components/navigation-menu.tsx
// Changes: Added app-specific items in NavigationMenuList for budgeting navigation (similar to sidebar).
// Integrated with useBudget for user state (e.g., conditional Profile/Login).
// Used React Router for links. No UI alterations; just populated content for functionality.

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../utils/utils";
import { Link } from "react-router-dom"; // For navigation logic
import { useBudget } from "../context/budget_context"; // For user state

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  const { state } = useBudget();
  const user = state.user;

  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...props}
    >
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link to="/dashboard">Dashboard</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link to="/transactions">Transactions</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link to="/reports">Reports</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link to="/goals">Goals</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link to="/login">{user ? `Profile (${user.name})` : "Login"}</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
      {/* Add submenus if needed, e.g., for categories */}
    </NavigationMenuPrimitive.List>
  );
}

// ... (Rest of the original code unchanged: NavigationMenuItem, navigationMenuTriggerStyle, etc.)

export {
  NavigationMenu,
  NavigationMenuList, // Updated with app logic
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};

export default NavigationMenu;

export { NavigationMenu };
