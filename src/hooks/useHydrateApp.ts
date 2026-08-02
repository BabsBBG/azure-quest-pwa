import { useEffect } from "react";
import { ANONYMOUS_STORAGE_OWNER, useAppStore } from "../store/useAppStore";

export function useHydrateApp(ownerId?: string | null, paused = false) {
  const hydrate = useAppStore((state) => state.hydrate);
  const hydrated = useAppStore((state) => state.hydrated);
  const storageOwnerId = useAppStore((state) => state.storageOwnerId);
  const effectiveOwnerId = ownerId || ANONYMOUS_STORAGE_OWNER;

  useEffect(() => {
    if (!paused && (!hydrated || storageOwnerId !== effectiveOwnerId)) void hydrate(effectiveOwnerId);
  }, [effectiveOwnerId, hydrate, hydrated, paused, storageOwnerId]);

  return !paused && hydrated && storageOwnerId === effectiveOwnerId;
}
