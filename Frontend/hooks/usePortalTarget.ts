"use client";

import { useState, useEffect } from "react";

export function usePortalTarget(id: string) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById(id));
  }, [id]);

  return target;
}
