import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

export function useHydrateApp() {
  const hydrate = useAppStore((state) => state.hydrate);
  const hydrated = useAppStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrate, hydrated]);

  return hydrated;
}
