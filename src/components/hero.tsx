"use client";

import { motion } from "motion/react";

export function HeroMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
    >
      {children}
    </motion.div>
  );
}

export function HeroItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { y: 12 }, show: { y: 0, transition: { duration: 0.45 } } }}
    >
      {children}
    </motion.div>
  );
}
