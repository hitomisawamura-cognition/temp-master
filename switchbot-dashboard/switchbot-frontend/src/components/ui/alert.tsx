import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva('flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-3 text-sm', {
  variants: {
    variant: {
      info: 'border-info/40 bg-info/10 text-foreground',
      warning: 'border-warning/50 bg-warning/15 text-foreground',
      danger: 'border-danger/50 bg-danger/10 text-foreground',
    },
  },
  defaultVariants: { variant: 'info' },
});

export interface AlertProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, role, ...props }: AlertProps) {
  return (
    <div
      role={role ?? (variant === 'danger' ? 'alert' : 'status')}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}
