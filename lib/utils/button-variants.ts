import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-foreground hover:bg-indigo-600",
        outline: "border border-slate-200 bg-transparent hover:bg-slate-50",
        ghost: "hover:bg-slate-100",
        subtle: "bg-slate-100 text-slate-900 hover:bg-slate-200"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
