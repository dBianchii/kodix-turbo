import { cn } from ".";

export type TextareaProps = React.ComponentProps<"textarea">;

const Textarea = ({ className, ...props }: TextareaProps) => (
  <textarea
    className={cn(
      "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-2xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
);

export { Textarea };
