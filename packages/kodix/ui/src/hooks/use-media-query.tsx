import { useEffect, useState } from "react";

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

  const [matches, setMatches] = useState(true); //Tested changing it to true
  useEffect(() => {
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
