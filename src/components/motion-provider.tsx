"use client";

import { MotionConfig } from "motion/react";

/** Respect the OS "reduce motion" setting everywhere (transforms/layout are skipped). */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
