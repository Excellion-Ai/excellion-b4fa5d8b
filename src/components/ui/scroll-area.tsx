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
        gold: "bg-transparent rounded-full",
        purple: "bg-transparent rounded-full",
        grey: "bg-transparent rounded-full",
      },
      orientation: {
        vertical: "h-full w-2.5 border-l border-l-transparent p-[1px]",
        horizontal: "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      },
    },
    defaultVariants: {
      variant: "purple",
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
        gold: "bg-orange-500 hover:bg-orange-400 transition-colors",
        purple: "bg-purple-950 hover:bg-purple-900 transition-colors",
        grey: "bg-gray-500/40 hover:bg-gray-400/50 transition-colors",
      },
    },
    defaultVariants: {
      variant: "purple",
    },
  }
);

interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  scrollbarVariant?: "default" | "gold" | "purple" | "grey";
}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, children, scrollbarVariant = "purple", ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport>
    <ScrollBar variant={scrollbarVariant} />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

interface ScrollBarProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  VariantProps<typeof scrollBarVariants> {
  variant?: "default" | "gold" | "purple" | "grey";
}

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(({ className, orientation = "vertical", variant = "purple", ...props }, ref) => (
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
