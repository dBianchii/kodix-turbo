import { useEffect } from "react";
import { create } from "zustand";

const useOverlayStore = create<{
  overlays: Record<string, boolean>;
  setOverlayMounted: (key: string, mounted: boolean) => void;
}>((set) => ({
  overlays: {},
  setOverlayMounted: (key, mounted) =>
    set((state) => ({
      overlays: { ...state.overlays, [key]: mounted },
    })),
}));

/**
 * Custom hook to determine if any overlay is currently mounted.
 */
export const useIsAnyOverlayMounted = () =>
  useOverlayStore((state) =>
    Object.values(state.overlays).some((mounted) => mounted),
  );

export const useOverlayLifecycle_only_ui = (key: string) => {
  const setOverlayMounted = useOverlayStore((state) => state.setOverlayMounted);

  useEffect(() => {
    setOverlayMounted(key, true);
    return () => setOverlayMounted(key, false);
  }, [setOverlayMounted, key]);
};
