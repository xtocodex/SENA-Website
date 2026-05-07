import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const flexVariants = cva(
  "flex",
  {
    variants: {
      direction: {
        row: "flex-row",
        col: "flex-col",
        "row-reverse": "flex-row-reverse",
        "col-reverse": "flex-col-reverse",
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
        baseline: "items-baseline",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
        evenly: "justify-evenly",
      },
      wrap: {
        nowrap: "flex-nowrap",
        wrap: "flex-wrap",
        "wrap-reverse": "flex-wrap-reverse",
      },
    },
    defaultVariants: {
      direction: "row",
    },
  }
)

const Flex = React.forwardRef(({ className, direction, align, justify, wrap, ...props }, ref) => (
  <div ref={ref} className={cn(flexVariants({ direction, align, justify, wrap }), className)} {...props} />
))
Flex.displayName = "Flex"

const gridVariants = cva(
  "grid",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6",
        12: "grid-cols-12",
      },
      gap: {
        0: "gap-0",
        1: "gap-1",
        2: "gap-2",
        3: "gap-3",
        4: "gap-4",
        6: "gap-6",
        8: "gap-8",
      },
      state: {
        visible: "grid-rows-[1fr] opacity-100 transition-all duration-300 ease-in-out",
        hidden: "grid-rows-[0fr] opacity-0 transition-all duration-300 ease-in-out",
      },
    },
    defaultVariants: {
      cols: 1,
    },
  }
)

const Grid = React.forwardRef(({ className, cols, gap, state, ...props }, ref) => (
  <div ref={ref} className={cn(gridVariants({ cols, gap, state }), className)} {...props} />
))
Grid.displayName = "Grid"

const containerVariants = cva(
  "w-full mx-auto",
  {
    variants: {
      maxWidth: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        screen: "max-w-screen-xl",
      },
    },
    defaultVariants: {
      maxWidth: "screen",
    },
  }
)

const Container = React.forwardRef(({ className, maxWidth, ...props }, ref) => (
  <div ref={ref} className={cn(containerVariants({ maxWidth }), className)} {...props} />
))
Container.displayName = "Container"

const Box = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("block", className)} {...props} />
))
Box.displayName = "Box"

export { Flex, Grid, Container, Box }
