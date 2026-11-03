"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ChartColumnBig,
  Database,
  Factory,
  Headset,
  Landmark,
  RefreshCw,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { ecoNodes, type EcoNodeId } from "@/data/content/ecosystem";
import { cn } from "@/lib/utils";

interface Box {
  id: EcoNodeId;
  x: number;
  y: number;
  w: number;
  h: number;
  icon: LucideIcon;
  stroke: string;
  fill: string;
  ink: string;
}

const BOXES: Box[] = [
  { id: "dmi", x: 300, y: 10, w: 400, h: 92, icon: ShieldCheck, stroke: "#19365d", fill: "#ffffff", ink: "#19365d" },
  { id: "register", x: 330, y: 150, w: 340, h: 84, icon: Database, stroke: "#664575", fill: "#faf6fe", ink: "#664575" },
  { id: "pdx", x: 360, y: 290, w: 280, h: 96, icon: RefreshCw, stroke: "#185c78", fill: "#f1fbfa", ink: "#185c78" },
  { id: "vraag", x: 20, y: 200, w: 190, h: 260, icon: Landmark, stroke: "#27538d", fill: "#f7fafd", ink: "#27538d" },
  { id: "aanbod", x: 790, y: 200, w: 190, h: 260, icon: Factory, stroke: "#4e6838", fill: "#f4faf2", ink: "#4e6838" },
  { id: "dashboard", x: 245, y: 470, w: 245, h: 112, icon: ChartColumnBig, stroke: "#664575", fill: "#faf6fe", ink: "#664575" },
  { id: "csc", x: 510, y: 470, w: 245, h: 112, icon: Headset, stroke: "#27538d", fill: "#f7fafd", ink: "#27538d" },
];

interface Flow {
  d: string;
  label?: [string, string];
  lx?: number;
  ly?: number;
  color: string;
  delay: number;
}

const FLOWS: Flow[] = [
  { d: "M500 102 L500 146", color: "#19365d", delay: 0.4 },
  { d: "M500 234 L500 286", color: "#19365d", delay: 0.55 },
  { d: "M210 318 L356 318", label: ["Plaatsen van", "informatiebehoeften"], lx: 283, ly: 290, color: "#19365d", delay: 0.8 },
  { d: "M360 358 L214 358", label: ["Beschikbare", "indicatoren en data"], lx: 287, ly: 380, color: "#185c78", delay: 0.95 },
  { d: "M790 318 L644 318", label: ["Aanbieden van", "datasets en indicatoren"], lx: 717, ly: 290, color: "#4e6838", delay: 1.1 },
  { d: "M640 358 L786 358", label: ["Transacties en", "data-uitwisseling"], lx: 713, ly: 380, color: "#185c78", delay: 1.25 },
  { d: "M500 386 L500 425 L367 425 L367 466", color: "#185c78", delay: 1.4 },
  { d: "M500 425 L632 425 L632 466", color: "#185c78", delay: 1.5 },
];

export function EcosystemDiagram() {
  const [selected, setSelected] = useState<EcoNodeId>("register");
  const node = ecoNodes[selected];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Diagram (md+) */}
      <div className="hidden rounded-2xl border border-border bg-white p-4 shadow-dmi-sm md:block">
        <svg viewBox="0 0 1000 595" className="h-auto w-full" role="group" aria-label="DMI-ecosysteem">
          <defs>
            {["#19365d", "#185c78", "#4e6838"].map((c) => (
              <marker key={c} id={`arrow-${c.slice(1)}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill={c} />
              </marker>
            ))}
          </defs>


          {FLOWS.map((f, i) => (
            <g key={i}>
              <motion.path
                d={f.d}
                fill="none"
                stroke={f.color}
                strokeWidth={2.5}
                markerEnd={`url(#arrow-${f.color.slice(1)})`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: f.delay, ease: "easeOut" }}
              />
              {f.label && (
                <motion.text
                  x={f.lx}
                  y={f.ly}
                  textAnchor="middle"
                  className="fill-dmi-navy text-[13px]"
                >
                  <tspan x={f.lx} dy="0">{f.label[0]}</tspan>
                  <tspan x={f.lx} dy="14">{f.label[1]}</tspan>
                </motion.text>
              )}
            </g>
          ))}

          {BOXES.map((b, i) => {
            const n = ecoNodes[b.id];
            const active = selected === b.id;
            const Icon = b.icon;
            const tall = b.h > 200;
            return (
              <motion.g
                key={b.id}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                aria-label={n.title}
                onClick={() => setSelected(b.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelected(b.id))}
                className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[4]"
                initial={{ y: 12 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{ scale: 1.015 }}
                style={{ transformOrigin: `${b.x + b.w / 2}px ${b.y + b.h / 2}px` }}
              >
                <rect
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  rx={14}
                  fill={b.fill}
                  stroke={b.stroke}
                  strokeWidth={active ? 3.5 : 1.5}
                />
                {active && (
                  <motion.rect
                    layoutId="eco-glow"
                    x={b.x - 5}
                    y={b.y - 5}
                    width={b.w + 10}
                    height={b.h + 10}
                    rx={18}
                    fill="none"
                    stroke="#f5bd42"
                    strokeWidth={3}
                  />
                )}
                {tall ? (
                  <>
                    <text x={b.x + b.w / 2} y={b.y + 36} textAnchor="middle" className="font-heading text-[20px] font-bold" fill={b.ink}>
                      {n.title.toUpperCase()}
                    </text>
                    <Icon x={b.x + b.w / 2 - 24} y={b.y + 52} width={48} height={48} color={b.ink} strokeWidth={1.4} />
                    <foreignObject x={b.x + 10} y={b.y + 108} width={b.w - 20} height={60}>
                      <p className="text-center text-[14px] font-medium leading-tight" style={{ color: b.ink }}>
                        {n.subtitle}
                      </p>
                    </foreignObject>
                    <text x={b.x + b.w / 2} y={b.y + 215} textAnchor="middle" className="text-[12px]" fill={b.ink}>
                      {b.id === "vraag" ? "Gemeentelijke" : "Datasets en"}
                    </text>
                    <text x={b.x + b.w / 2} y={b.y + 231} textAnchor="middle" className="text-[12px]" fill={b.ink}>
                      {b.id === "vraag" ? "dashboards" : "indicatoren"}
                    </text>
                  </>
                ) : (
                  <>
                    <Icon x={b.x + 18} y={b.y + b.h / 2 - 18} width={36} height={36} color={b.ink} strokeWidth={1.5} />
                    <text x={b.x + 66} y={b.y + b.h / 2 - 6} className="font-heading text-[18px] font-bold" fill={b.ink}>
                      {n.title}
                    </text>
                    <foreignObject x={b.x + 66} y={b.y + b.h / 2 + 1} width={b.w - 78} height={48}>
                      <p className="text-[12.5px] leading-tight text-[#1f2a3d]">{n.subtitle}</p>
                    </foreignObject>
                  </>
                )}
              </motion.g>
            );
          })}
          {/* VRAAG: separator above "Gemeentelijke dashboards" */}
          <line x1="34" y1="392" x2="196" y2="392" stroke="#abccf1" strokeDasharray="4 4" pointerEvents="none" />
        </svg>
        <p className="mt-2 text-center text-xs text-muted-foreground">Klik op een onderdeel voor uitleg.</p>
      </div>

      {/* Stacked list (mobile) */}
      <div className="grid gap-2 md:hidden">
        {BOXES.map((b) => {
          const Icon = b.icon;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelected(b.id)}
              aria-pressed={selected === b.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-white p-3 text-left",
                selected === b.id ? "border-dmi-navy ring-2 ring-dmi-gold" : "border-border"
              )}
            >
              <Icon className="size-6 shrink-0" style={{ color: b.ink }} />
              <span>
                <span className="block font-heading font-semibold" style={{ color: b.ink }}>{ecoNodes[b.id].title}</span>
                <span className="block text-xs text-muted-foreground">{ecoNodes[b.id].subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-border bg-white p-6 shadow-dmi-md"
          >
            <p className="dmi-tag text-[10px] text-dmi-blue">Onderdeel</p>
            <h2 className="mt-1 font-heading text-2xl font-semibold text-dmi-navy">{node.title}</h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{node.subtitle}</p>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed">
              {node.body.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-dmi-gold" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            {node.link && (
              <Link href={node.link.href} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-dmi-blue hover:underline">
                {node.link.label} <ArrowRight className="size-4" />
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </aside>
    </div>
  );
}
