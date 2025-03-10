"use client";

import dynamic from "next/dynamic";
import { LuLoader2 } from "react-icons/lu";

//Can it be possible to SSR this?
const ShiftsBigCalendar = dynamic(() => import("./shifts-big-calendar"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[700px] flex-col items-center justify-center">
      <LuLoader2 className="size-8 animate-spin" />
    </div>
  ),
});

export default ShiftsBigCalendar;
