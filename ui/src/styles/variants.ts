import { cva } from 'class-variance-authority';

export const blueBgBorderVariants = cva('border text-accent-foreground', {
  variants: {
    variant: {
      default: 'border-primary bg-blue-100 dark:bg-blue-950',
      withHover:
        'border-primary bg-blue-100 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-950',
      hoverOnly:
        'hover:border-primary hover:bg-blue-100 dark:hover:bg-blue-950',
      destructive: 'border-destructive bg-red-100 dark:bg-red-950',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
