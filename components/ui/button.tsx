"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { buttonVariants, type ButtonVariantProps } from "@/lib/utils/button-variants";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { className, variant, size, ...rest } = props;
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...rest}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
