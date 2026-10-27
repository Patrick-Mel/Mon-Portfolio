import {
  Activity,
  BrickWall,
  Cloud,
  Code,
  Container,
  Database,
  GitBranch,
  Grid3x3,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Lock,
  Network,
  Palette,
  PenTool,
  Plug,
  Route,
  Router,
  Server,
  Shield,
  Terminal,
  Wifi,
  type LucideIcon,
} from "lucide-react";

/**
 * Registre fermé des icônes utilisables depuis l'admin (services, compétences).
 * Seules ces icônes sont incluses dans le bundle.
 */
export const ICONS = {
  network: Network,
  router: Router,
  route: Route,
  firewall: BrickWall,
  vpn: Lock,
  wifi: Wifi,
  server: Server,
  terminal: Terminal,
  shield: Shield,
  database: Database,
  container: Container,
  layers: Layers,
  activity: Activity,
  cloud: Cloud,
  code: Code,
  layout: LayoutTemplate,
  plug: Plug,
  git: GitBranch,
  pen: PenTool,
  palette: Palette,
  grid: Grid3x3,
  image: ImageIcon,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export function Icon({ name, className, size = 20 }: { name: string; className?: string; size?: number }) {
  const Cmp = ICONS[name as IconName] ?? Code;
  return <Cmp aria-hidden className={className} size={size} strokeWidth={1.6} />;
}
