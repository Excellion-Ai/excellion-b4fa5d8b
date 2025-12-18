import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const scrollBarVariants = cva(
  "flex touch-none select-none transition-colors",
  {
    variants: {
      variant: {
        default: "",
        gold: "bg-zinc-900 rounded-full",
      },
      orientation: {
        vertical: "h-full w-2.5 border-l border-l-transparent p-[1px]",
        horizontal: "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      },
    },
    defaultVariants: {
      variant: "default",
      orientation: "vertical",
    },
  }
);

const scrollThumbVariants = cva(
  "relative flex-1 rounded-full",
  {
    variants: {
      variant: {
        default: "bg-border",
        gold: "bg-amber-500 hover:bg-amber-400 transition-colors",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  scrollbarVariant?: "default" | "gold";
}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, children, scrollbarVariant = "default", ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport>
    <ScrollBar variant={scrollbarVariant} />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

interface ScrollBarProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  VariantProps<typeof scrollBarVariants> {
  variant?: "default" | "gold";
}

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(({ className, orientation = "vertical", variant = "default", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(scrollBarVariants({ variant, orientation }), className)}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className={cn(scrollThumbVariants({ variant }))} />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
