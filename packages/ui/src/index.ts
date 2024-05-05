import type { ClassValue } from "clsx";
import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export function useMediaQuery({ query }: { query: "md" | "lg" }) {
  let widthText = "";

  switch (query) {
    case "md":
      widthText = "(min-width: 768px)";
      break;
    case "lg":
      widthText = "(min-width: 1024px)";
      break;
    default:
      break;
  }

  const [matches, setMatches] = React.useState(true); //Tested changing it to true
  React.useEffect(() => {
    const matchQueryList = window.matchMedia(widthText);
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    matchQueryList.addEventListener("change", handleChange);

    setMatches(matchQueryList.matches);

    return () => {
      matchQueryList.removeEventListener("change", handleChange);
    };
  }, [widthText]);
  return matches;
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay ?? 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
