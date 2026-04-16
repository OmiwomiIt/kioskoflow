import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            'flex h-12 w-full appearance-none rounded-xl border border-stone-200 bg-white px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };