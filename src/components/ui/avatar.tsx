import * as React from "react";
import { cn, initials } from "@/lib/utils";

interface AvatarProps extends React.ComponentProps<"span"> {
  name: string;
}

// Initials avatar: no photos of real people in a demo
function Avatar({ name, className, ...props }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-9 shrink-0 select-none items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-accent-foreground",
        className,
      )}
      {...props}
    >
      {initials(name)}
    </span>
  );
}

export { Avatar };
