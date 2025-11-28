import { useEffect, useState } from "react";

export const useOS = () => {
  const [os, setOS] = useState<"mac" | "windows" | "linux" | "unknown">(
    "unknown",
  );

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();

    if (ua.includes("mac")) {
      setOS("mac");
    } else if (ua.includes("win")) {
      setOS("windows");
    } else if (ua.includes("linux")) {
      setOS("linux");
    } else {
      setOS("unknown");
    }
  }, []);

  return os;
};
