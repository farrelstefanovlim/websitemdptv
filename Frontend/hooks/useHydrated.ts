import { useState, useEffect } from "react";

/**
 * Returns `true` only after client-side hydration is complete.
 * Use this to guard components that depend on localStorage-persisted Zustand stores,
 * preventing server/client mismatch warnings.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
