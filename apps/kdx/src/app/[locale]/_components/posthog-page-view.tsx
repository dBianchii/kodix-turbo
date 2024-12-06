"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

import { usePathname } from "~/i18n/routing";

export default function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  useEffect(() => {
    // Track pageviews
    if (!pathname) return;

    let url = window.origin + pathname;
    if (searchParams.toString()) {
      url = url + `?${searchParams.toString()}`;
    }
    posthog.capture("$pageview", {
      $current_url: url,
    });
  }, [pathname, searchParams, posthog]);

  return null;
}
