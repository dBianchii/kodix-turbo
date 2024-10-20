import { useEffect, useState } from "react";

/**
 * Hook that triggers a re-render if any of the provided dates are within one minute and one second from the current time.
 * This is useful for components that display relative time.
 * Ignores undefined or null dates.
 * @param dates - An array of Date objects to be monitored.
 */
export function useRerenderForRelativeTime(dates: (Date | undefined | null)[]) {
  //TODO: Make me rerender every minute when necessary, then every hour, then every day, then every week, then every month, then every year. (yeh...)
  const ONE_SECOND = 1000;
  const ONE_MINUTE = 60000;
  const [_, setTick] = useState(0);
  const datesToWatch = dates.filter((x) => x) as Date[]; //Remove undefined dates

  useEffect(() => {
    const func = () => {
      const times = datesToWatch.map((date) => date.getTime());
      const now = new Date().getTime();
      if (times.some((time) => now - time <= ONE_MINUTE + ONE_SECOND)) {
        setTick((tick) => tick + 1);
        return;
      }
      clearInterval(interval);
    };

    const interval = setInterval(func, ONE_SECOND);
    return () => clearInterval(interval);
  });
}
