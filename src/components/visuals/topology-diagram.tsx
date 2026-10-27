import { cn } from "@/lib/cn";
import { tr } from "@/lib/i18n-utils";
import type { Diagram, DiagramNode, DiagramNodeKind, Locale } from "@/lib/types";

const NODE = 44;

/** Pictogrammes des équipements, dessinés dans une boîte 24×24 centrée. */
export function Glyph({ kind }: { kind: DiagramNodeKind }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "router":
      return (
        <g {...p}>
          <circle cx="12" cy="12" r="8" />
          <path d="M8 12h8M13.5 9.5L16 12l-2.5 2.5M12 8v8" />
        </g>
      );
    case "firewall":
      return (
        <g {...p}>
          <rect x="3" y="5" width="18" height="14" rx="1" />
          <path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 9.7v4.6M9 14.3V19" />
        </g>
      );
    case "switch":
      return (
        <g {...p}>
          <rect x="2.5" y="8" width="19" height="8" rx="1.5" />
          <path d="M6 12h.01M9 12h.01M12 12h.01M15 12h.01M18 12h.01" strokeWidth="2.2" />
        </g>
      );
    case "server":
      return (
        <g {...p}>
          <rect x="4" y="3.5" width="16" height="7" rx="1.2" />
          <rect x="4" y="13.5" width="16" height="7" rx="1.2" />
          <path d="M7.5 7h.01M7.5 17h.01" strokeWidth="2.2" />
        </g>
      );
    case "client":
      return (
        <g {...p}>
          <rect x="3" y="4.5" width="18" height="12" rx="1.2" />
          <path d="M9 20h6M12 16.5V20" />
        </g>
      );
    case "cloud":
      return (
        <g {...p}>
          <path d="M7 18h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.2 4.4 4.4 0 0 0 7 18Z" />
        </g>
      );
    case "database":
      return (
        <g {...p}>
          <ellipse cx="12" cy="6" rx="7" ry="2.6" />
          <path d="M5 6v12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6" />
        </g>
      );
    case "app":
      return (
        <g {...p}>
          <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
          <path d="M3.5 8.5h17M7 12.5l2 2-2 2M11.5 16.5h4" />
        </g>
      );
    case "monitor":
      return (
        <g {...p}>
          <path d="M3 12h4l2-5 3.5 10 2.5-7 1.5 2H21" />
        </g>
      );
    case "vpn":
      return (
        <g {...p}>
          <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
        </g>
      );
  }
}

function nodeCenter(n: DiagramNode) {
  return { x: n.x, y: n.y };
}

/**
 * Schéma de topologie / d'architecture rendu en SVG à partir de données.
 * Couleurs pilotées par les tokens : identique en thème clair et sombre.
 */
export function TopologyDiagram({
  diagram,
  locale,
  compact = false,
  animated = true,
  className,
  titleId,
}: {
  diagram: Diagram;
  locale: Locale;
  compact?: boolean;
  animated?: boolean;
  className?: string;
  titleId?: string;
}) {
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));
  const title = tr(diagram.title, locale);

  return (
    <svg
      viewBox={`0 0 ${diagram.width} ${diagram.height}`}
      role="img"
      aria-labelledby={titleId}
      aria-label={titleId ? undefined : title}
      className={cn("h-auto w-full select-none", className)}
    >
      {/* Zones (sites, VLAN, serveurs) */}
      {diagram.zones?.map((z, i) => (
        <g key={i}>
          <rect
            x={z.x}
            y={z.y}
            width={z.w}
            height={z.h}
            rx="10"
            fill="var(--accent-soft)"
            fillOpacity="0.35"
            stroke="var(--line-strong)"
            strokeDasharray="4 5"
          />
          {!compact && (
            <text x={z.x + 12} y={z.y + 20} className="fill-subtle font-mono" fontSize="11" letterSpacing="0.04em">
              {tr(z.label, locale)}
            </text>
          )}
        </g>
      ))}

      {/* Liaisons */}
      {diagram.links.map((l, i) => {
        const a = byId.get(l.from);
        const b = byId.get(l.to);
        if (!a || !b) return null;
        const p1 = nodeCenter(a);
        const p2 = nodeCenter(b);
        const d = `M${p1.x} ${p1.y}L${p2.x} ${p2.y}`;
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const label = tr(l.label, locale);
        const tunnel = l.style === "tunnel";
        return (
          <g key={i}>
            {tunnel && <path d={d} stroke="var(--accent)" strokeOpacity="0.18" strokeWidth="9" strokeLinecap="round" />}
            <path
              d={d}
              fill="none"
              stroke={tunnel ? "var(--accent)" : "var(--line-strong)"}
              strokeWidth={tunnel ? 1.8 : 1.4}
              strokeDasharray={l.style === "dashed" ? "5 5" : tunnel ? "8 6" : undefined}
              className={tunnel && animated ? "motion-safe:animate-[dash_1.4s_linear_infinite]" : undefined}
            />
            {animated && !compact && (
              <circle r="3" fill="var(--accent)" className="motion-packet" style={{ offsetPath: `path("${d}")`, animation: `packet ${2.6 + (i % 3) * 0.7}s linear ${i * 0.45}s infinite` }} />
            )}
            {label && !compact && (
              <g transform={`translate(${mx} ${my})`}>
                <rect x={-(label.length * 3.4 + 8)} y="-9" width={label.length * 6.8 + 16} height="18" rx="4" fill="var(--surface)" stroke="var(--line)" />
                <text textAnchor="middle" dominantBaseline="central" className={tunnel ? "fill-accent-ink font-mono" : "fill-muted font-mono"} fontSize="10.5">
                  {label}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Nœuds */}
      {diagram.nodes.map((n) => {
        const s = compact ? NODE * 0.9 : NODE;
        return (
          <g key={n.id} transform={`translate(${n.x - s / 2} ${n.y - s / 2})`}>
            <path
              d={`M8 0H${s}V${s - 8}L${s - 8} ${s}H0V8Z`}
              fill="var(--surface)"
              stroke={n.kind === "firewall" || n.kind === "vpn" ? "var(--accent)" : "var(--fg)"}
              strokeOpacity={n.kind === "firewall" || n.kind === "vpn" ? 1 : 0.55}
              strokeWidth="1.4"
            />
            <g transform={`translate(${s / 2 - 12} ${s / 2 - 12})`} className="text-fg">
              <Glyph kind={n.kind} />
            </g>
            {!compact && (
              <>
                <text x={s / 2} y={s + 16} textAnchor="middle" className="fill-fg font-sans" fontSize="12.5" fontWeight="600">
                  {tr(n.label, locale)}
                </text>
                {n.sub && (
                  <text x={s / 2} y={s + 30} textAnchor="middle" className="fill-subtle font-mono" fontSize="10">
                    {tr(n.sub, locale)}
                  </text>
                )}
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
