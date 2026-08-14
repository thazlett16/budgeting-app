import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

export const buttonVariants = tv({
  base: [
    'group/button',
    'relative inline-flex items-center justify-center gap-2',
    'cursor-default font-medium transition-colors outline-none select-none',
    'data-disabled:pointer-events-none data-disabled:opacity-50',
    'data-focus-visible:ring-2 data-focus-visible:ring-offset-2',
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
  variants: {
    variant: {
      primary: [
        'bg-primary text-primary-foreground',
        'data-hovered:bg-primary-hover',
        'data-pressed:bg-primary-hover data-pressed:brightness-95',
        'data-focus-visible:ring-primary',
      ],
      danger: [
        'bg-danger text-danger-foreground',
        'data-hovered:bg-danger-hover',
        'data-pressed:bg-danger-hover data-pressed:brightness-95',
        'data-focus-visible:ring-danger',
      ],
      ghost: [
        'bg-transparent text-foreground',
        'data-focus-visible:ring-foreground',
        'data-hovered:bg-muted',
        'data-pressed:bg-muted-hover',
        'data-disabled:bg-transparent',
      ],
    },
    size: {
      sm: 'h-7 rounded-md px-2.5 text-xs',
      md: 'h-9 rounded-lg px-3.5 text-sm',
      lg: 'h-11 rounded-lg px-5 text-base',
    },
  },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;
