import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96] btn-active',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-orange-700',
        secondary: 'bg-stone-800 text-white shadow-lg shadow-stone-800/20 hover:bg-stone-900',
        outline: 'border-2 border-stone-200 bg-transparent hover:bg-stone-50 text-stone-700 hover:border-stone-300',
        ghost: 'hover:bg-stone-100 text-stone-700',
        destructive: 'bg-red-500 text-white shadow-lg shadow-red-500/25 hover:bg-red-600',
        success: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };