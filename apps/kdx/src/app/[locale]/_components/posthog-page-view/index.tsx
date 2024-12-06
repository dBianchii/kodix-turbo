"use client";

import dynamic from "next/dynamic";

const PostHogPageView = dynamic(() => import("./posthog-page-view"), {
  ssr: false,
});

export default PostHogPageView;
