"use client";

import { useState } from "react";

export interface DailyPoint {
  day: string;
  views: number;
  visitors: number;
}

const fmtDay = (d: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`));

/**
 * Pages vues par jour : une seule série (pas de légende, le titre la nomme),
 * barres fines arrondies côté données, grille discrète, infobulle au survol/focus
 * et tableau équivalent pour les lecteurs d'écran.
 */
export function DailyViewsChart({ data }: { data: DailyPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 220;
  const pad = { t: 12, r: 8, b: 28, l: 36 };
  const max = Math.max(4, ...data.map((d) => d.views));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const ticks = [0, top / 2, top];
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const bw = iw / Math.max(1, data.length);
  const barW = Math.max(2, bw - 2); // 2 px d'espace entre barres
  const y = (v: number) => pad.t + ih - (v / top) * ih;
  const point = hover != null ? data[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Pages vues par jour" onMouseLeave={() => setHover(null)}>
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={pad.l} x2={W - pad.r} y1={y(tk)} y2={y(tk)} stroke="var(--line)" strokeWidth="1" />
            <text x={pad.l - 6} y={y(tk)} textAnchor="end" dominantBaseline="central" className="fill-subtle font-mono" fontSize="10">
              {tk}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const h = Math.max(d.views ? 2 : 0, ih - (y(d.views) - pad.t));
          const x = pad.l + i * bw + (bw - barW) / 2;
          const r = Math.min(4, barW / 2, h);
          const yTop = pad.t + ih - h;
          return (
            <g key={d.day}>
              {h > 0 && (
                <path
                  d={`M${x} ${pad.t + ih}V${yTop + r}Q${x} ${yTop} ${x + r} ${yTop}H${x + barW - r}Q${x + barW} ${yTop} ${x + barW} ${yTop + r}V${pad.t + ih}Z`}
                  fill="var(--accent)"
                  opacity={hover == null || hover === i ? 1 : 0.45}
                />
              )}
              {/* Zone de survol plus large que la barre */}
              <rect
                x={pad.l + i * bw}
                y={pad.t}
                width={bw}
                height={ih}
                fill="transparent"
                tabIndex={0}
                aria-label={`${fmtDay(d.day)} : ${d.views} vues, ${d.visitors} visiteurs`}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="outline-none"
              />
            </g>
          );
        })}
        {[0, Math.floor((data.length - 1) / 2), data.length - 1]
          .filter((i, k, arr) => data[i] && arr.indexOf(i) === k)
          .map((i) => (
            <text key={i} x={pad.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" className="fill-subtle font-mono" fontSize="10">
              {fmtDay(data[i]!.day)}
            </text>
          ))}
        <line x1={pad.l} x2={W - pad.r} y1={pad.t + ih} y2={pad.t + ih} stroke="var(--line-strong)" />
      </svg>
      {point && hover != null && (
        <div
          className="pointer-events-none absolute top-0 rounded-sm border border-line bg-surface px-3 py-2 text-xs shadow-2"
          style={{ left: `clamp(0px, calc(${((pad.l + hover * bw + bw / 2) / W) * 100}% - 70px), calc(100% - 140px))` }}
        >
          <p className="font-mono text-subtle">{fmtDay(point.day)}</p>
          <p className="text-fg">
            <span className="font-medium">{point.views}</span> vues · <span className="font-medium">{point.visitors}</span> visiteurs
          </p>
        </div>
      )}
      <table className="sr-only">
        <caption>Pages vues et visiteurs par jour</caption>
        <thead>
          <tr>
            <th>Jour</th>
            <th>Vues</th>
            <th>Visiteurs</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <td>{d.day}</td>
              <td>{d.views}</td>
              <td>{d.visitors}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
