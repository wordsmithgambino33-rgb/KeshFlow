

"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../utils/utils";

function Progress({
  className,
  value = 0,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { value?: number }) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - clampedValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };


export default Progress;

export { Progress };
