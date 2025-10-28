import { cn } from "..";

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  // biome-ignore lint/suspicious/noExplicitAny: <biome migration>
  [key: string]: any;
}

export default function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-col": vertical,
          "flex-row": !vertical,
        },
        className,
      )}
    >
      {new Array(repeat).fill(0).map((_, i) => (
        <div
          className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
            "[animation-direction:reverse]": reverse,
            "animate-marquee flex-row": !vertical,
            "animate-marquee-vertical flex-col": vertical,
            "group-hover:[animation-play-state:paused]": pauseOnHover,
          })}
          // biome-ignore lint/suspicious/noArrayIndexKey: <biome migration>
          key={`marquee-${i}`}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
