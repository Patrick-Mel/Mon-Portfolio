import type { DiagramNodeKind } from "@/lib/types";
import { Glyph } from "./topology-diagram";

interface HeroNode {
  id: string;
  kind: DiagramNodeKind;
  x: number;
  y: number;
  label: string;
  addr?: string;
  accent?: boolean;
  place?: "right" | "below" | "above";
}

/* Termes techniques neutres : identiques en français et en anglais. */
const nodes: HeroNode[] = [
  { id: "wan", kind: "cloud", x: 392, y: 62, label: "wan" },
  { id: "fw", kind: "firewall", x: 392, y: 188, label: "edge-fw", addr: "10.0.0.1", accent: true },
  { id: "core", kind: "switch", x: 236, y: 188, label: "core-sw", addr: "vlan 10·20·30", place: "above" },
  { id: "srv1", kind: "server", x: 84, y: 112, label: "srv-01", addr: "10.0.20.11", place: "below" },
  { id: "srv2", kind: "server", x: 84, y: 264, label: "srv-02", addr: "10.0.20.12", place: "below" },
  { id: "app", kind: "app", x: 236, y: 352, label: "app", addr: ":443", place: "below" },
  { id: "db", kind: "database", x: 84, y: 430, label: "db", addr: ":5432", place: "below" },
  { id: "ui", kind: "client", x: 392, y: 430, label: "ui", addr: "design" },
];

/* Traces orthogonales, façon schéma de câblage. */
const traces = [
  "M392 84V166",
  "M370 188H258",
  "M214 188H160V112H106",
  "M160 188V264H106",
  "M236 210V330",
  "M214 352H160V430H106",
  "M258 352H320V430H370",
];

const SIZE = 40;

function NodeLabel({ node }: { node: HeroNode }) {
  const place = node.place ?? "right";
  const pos =
    place === "right"
      ? { x: SIZE + 10, y1: 15, y2: 30, anchor: "start" as const }
      : place === "below"
        ? { x: SIZE / 2, y1: SIZE + 16, y2: SIZE + 30, anchor: "middle" as const }
        : { x: SIZE / 2, y1: -24, y2: -10, anchor: "middle" as const };
  return (
    <>
      <text x={pos.x} y={pos.y1} textAnchor={pos.anchor} className="fill-fg font-mono" fontSize="11.5" fontWeight="500">
        {node.label}
      </text>
      {node.addr && (
        <text x={pos.x} y={pos.y2} textAnchor={pos.anchor} className="fill-subtle font-mono" fontSize="10">
          {node.addr}
        </text>
      )}
    </>
  );
}

/**
 * Élément visuel du hero : une petite infrastructure (du WAN à l'interface)
 * traversée par des paquets. 100 % SVG + CSS : aucun JavaScript, et les
 * paquets disparaissent si l'utilisateur préfère réduire les animations.
 */
export function HeroTopology({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 480 520" role="img" aria-label={label} className="h-auto w-full overflow-visible">
      <defs>
        <pattern id="hero-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--grid-dot)" />
        </pattern>
        <radialGradient id="hero-fade" cx="50%" cy="50%" r="60%">
          <stop offset="55%" stopColor="#fff" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <mask id="hero-mask">
          <rect width="480" height="520" fill="url(#hero-fade)" />
        </mask>
      </defs>
      <rect width="480" height="520" fill="url(#hero-grid)" mask="url(#hero-mask)" />

      {/* Zone LAN */}
      <rect x="40" y="70" width="240" height="432" rx="14" fill="none" stroke="var(--line-strong)" strokeDasharray="3 6" />
      <text x="56" y="62" className="fill-subtle font-mono" fontSize="10.5" letterSpacing="0.08em">
        LAN · 10.0.0.0/16
      </text>

      <g fill="none" strokeLinecap="square">
        {traces.map((d, i) => (
          <path key={i} d={d} stroke="var(--line-strong)" strokeWidth="1.5" />
        ))}
        <path d={traces[0]} stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="6 6" className="motion-safe:animate-[dash_1.2s_linear_infinite]" />
      </g>

      {traces.map((d, i) => (
        <rect
          key={i}
          x="-3"
          y="-3"
          width="6"
          height="6"
          fill="var(--accent)"
          className="motion-packet"
          style={{
            offsetPath: `path("${d}")`,
            offsetRotate: "0deg",
            animation: `packet ${2.2 + (i % 4) * 0.55}s cubic-bezier(.45,0,.55,1) ${i * 0.38}s infinite`,
          }}
        />
      ))}

      {nodes.map((n) => (
        <g key={n.id} transform={`translate(${n.x - SIZE / 2} ${n.y - SIZE / 2})`}>
          <path
            d={`M8 0H${SIZE}V${SIZE - 8}L${SIZE - 8} ${SIZE}H0V8Z`}
            fill="var(--bg)"
            stroke={n.accent ? "var(--accent)" : "var(--fg)"}
            strokeOpacity={n.accent ? 1 : 0.7}
            strokeWidth="1.5"
          />
          <g transform={`translate(${SIZE / 2 - 12} ${SIZE / 2 - 12})`} className={n.accent ? "text-accent-ink" : "text-fg"}>
            <Glyph kind={n.kind} />
          </g>
          <NodeLabel node={n} />
        </g>
      ))}
    </svg>
  );
}
