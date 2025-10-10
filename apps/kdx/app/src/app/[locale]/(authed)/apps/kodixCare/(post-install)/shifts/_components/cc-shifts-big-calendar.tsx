"use client";

import dynamic from "next/dynamic";
import { LuLoaderCircle } from "react-icons/lu";

//Can it be possible to SSR this?
const ShiftsBigCalendar = dynamic(() => import("./shifts-big-calendar"), {
  loading: () => (
    <div className="flex h-[700px] flex-col items-center justify-center">
      <LuLoaderCircle className="size-8 animate-spin" />
    </div>
  ),
  ssr: false,
});

export default ShiftsBigCalendar;
