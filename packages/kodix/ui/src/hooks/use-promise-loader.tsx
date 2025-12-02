import { useEffect, useState } from "react";

export const usePromiseLoader = <T,>(promise: Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    promise.then((result) => {
      setData(result);
      setIsLoading(false);
    });
  }, [promise]);

  return { data, isLoading };
};
