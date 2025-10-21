
// /ui/card.tsx
import * as React from "react";
import { cn } from "../utils/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}


export default Card;
