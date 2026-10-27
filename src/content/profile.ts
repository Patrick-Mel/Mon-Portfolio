/**
 * CONTENU D'EXEMPLE — chiffres clés, compétences et parcours.
 * Sert de repli quand Supabase n'est pas configuré et alimente `supabase/seed.sql`.
 * Tout est marqué `isExample: true` : l'admin affiche un badge « Exemple ».
 */
import type { KeyFigure, Skill, TimelineEntry } from "@/lib/types";

export const keyFigures: KeyFigure[] = [
  { id: "kf-years", value: "3", label: { fr: "années de formation à l'IAI Cameroun", en: "years of training at IAI Cameroon" }, sortOrder: 1, isExample: true },
  { id: "kf-degrees", value: "3", label: { fr: "diplômes : DTS, licence pro, ingénieur des travaux", en: "degrees: DTS, professional bachelor, engineering technologist" }, sortOrder: 2, isExample: true },
  { id: "kf-domains", value: "4", label: { fr: "domaines : réseaux, systèmes, développement, design", en: "fields: networks, systems, development, design" }, sortOrder: 3, isExample: true },
  { id: "kf-languages", value: "2", label: { fr: "langues de travail : français et anglais", en: "working languages: French and English" }, sortOrder: 4, isExample: true },
];

type SkillSeed = Omit<Skill, "id" | "sortOrder" | "isExample" | "name"> & { name: string };

const skillSeeds: SkillSeed[] = [
  // Réseaux
  { name: "Routage IP (OSPF, BGP, statique)", category: "network", level: "advanced", icon: "route", featured: true },
  { name: "Commutation & VLAN (802.1Q, STP)", category: "network", level: "advanced", icon: "network", featured: true },
  { name: "VPN IPsec & OpenVPN", category: "network", level: "advanced", icon: "vpn", featured: true },
  { name: "MPLS (maquettes L3VPN)", category: "network", level: "proficient", icon: "route", featured: false },
  { name: "Cisco IOS & Packet Tracer / GNS3", category: "network", level: "advanced", icon: "router", featured: false },
  { name: "pfSense / OPNsense", category: "network", level: "advanced", icon: "firewall", featured: true },
  { name: "Wi-Fi d'entreprise & câblage structuré", category: "network", level: "proficient", icon: "wifi", featured: false },
  // Systèmes & sécurité
  { name: "Linux (Debian, Ubuntu, Rocky)", category: "systems", level: "advanced", icon: "terminal", featured: true },
  { name: "Windows Server & Active Directory", category: "systems", level: "proficient", icon: "server", featured: true },
  { name: "Virtualisation (Proxmox, VirtualBox)", category: "systems", level: "proficient", icon: "layers", featured: false },
  { name: "Docker & Docker Compose", category: "systems", level: "proficient", icon: "container", featured: true },
  { name: "Supervision (Zabbix, Grafana)", category: "systems", level: "proficient", icon: "activity", featured: true },
  { name: "Durcissement & pare-feu (UFW, iptables)", category: "systems", level: "proficient", icon: "shield", featured: false },
  { name: "Scripts Bash & PowerShell", category: "systems", level: "proficient", icon: "code", featured: false },
  { name: "Sauvegarde & PRA", category: "systems", level: "learning", icon: "database", featured: false },
  // Full-stack
  { name: "TypeScript & JavaScript", category: "fullstack", level: "advanced", icon: "code", featured: true },
  { name: "React & Next.js", category: "fullstack", level: "advanced", icon: "layout", featured: true },
  { name: "Python & Django", category: "fullstack", level: "proficient", icon: "code", featured: false },
  { name: "PHP & Laravel", category: "fullstack", level: "proficient", icon: "code", featured: false },
  { name: "PostgreSQL & MySQL", category: "fullstack", level: "advanced", icon: "database", featured: true },
  { name: "API REST & authentification", category: "fullstack", level: "proficient", icon: "plug", featured: false },
  { name: "Git & CI/CD", category: "fullstack", level: "proficient", icon: "git", featured: false },
  // Design
  { name: "Figma (UI, prototypage)", category: "design", level: "advanced", icon: "pen", featured: true },
  { name: "Identité visuelle & logotypes", category: "design", level: "proficient", icon: "palette", featured: true },
  { name: "Design systems & tokens", category: "design", level: "proficient", icon: "grid", featured: false },
  { name: "Adobe Illustrator & Photoshop", category: "design", level: "proficient", icon: "image", featured: false },
];

/** Traductions anglaises ; les autres noms sont identiques dans les deux langues. */
const skillNameEn: Record<string, string> = {
  "Routage IP (OSPF, BGP, statique)": "IP routing (OSPF, BGP, static)",
  "Commutation & VLAN (802.1Q, STP)": "Switching & VLANs (802.1Q, STP)",
  "MPLS (maquettes L3VPN)": "MPLS (L3VPN labs)",
  "Wi-Fi d'entreprise & câblage structuré": "Enterprise Wi-Fi & structured cabling",
  "Virtualisation (Proxmox, VirtualBox)": "Virtualization (Proxmox, VirtualBox)",
  "Supervision (Zabbix, Grafana)": "Monitoring (Zabbix, Grafana)",
  "Durcissement & pare-feu (UFW, iptables)": "Hardening & firewalls (UFW, iptables)",
  "Scripts Bash & PowerShell": "Bash & PowerShell scripting",
  "Sauvegarde & PRA": "Backup & disaster recovery",
  "API REST & authentification": "REST APIs & authentication",
  "Identité visuelle & logotypes": "Visual identity & logos",
};

export const skills: Skill[] = skillSeeds.map(({ name, ...s }, i) => ({
  ...s,
  name: { fr: name, en: skillNameEn[name] ?? name },
  id: `skill-${i + 1}`,
  sortOrder: i + 1,
  isExample: true,
}));

export const timeline: TimelineEntry[] = [
  {
    id: "tl-engineer",
    kind: "education",
    title: {
      fr: "Diplôme d'ingénieur des travaux informatiques — option Systèmes et Réseaux",
      en: "Computer engineering technologist degree — Systems and Networks track",
    },
    organization: "IAI Cameroun",
    location: "Yaoundé",
    startDate: "2025-10",
    endDate: "2026-07",
    description: {
      fr: "Troisième année : architecture réseau d'entreprise, sécurité des systèmes, virtualisation, supervision et projet de fin d'études. Obtenu en parallèle de la licence professionnelle.",
      en: "Third year: enterprise network architecture, systems security, virtualization, monitoring and a final-year project. Earned alongside the professional bachelor's degree.",
    },
    sortOrder: 1,
    isExample: true,
  },
  {
    id: "tl-licence",
    kind: "education",
    title: {
      fr: "Licence professionnelle en Systèmes et Réseaux",
      en: "Professional bachelor's degree in Systems and Networks",
    },
    organization: "IAI Cameroun",
    location: "Yaoundé",
    startDate: "2025-10",
    endDate: "2026-07",
    description: {
      fr: "Routage et commutation avancés, VPN, services réseau Linux et Windows, administration et sécurisation d'infrastructures.",
      en: "Advanced routing and switching, VPNs, Linux and Windows network services, infrastructure administration and security.",
    },
    sortOrder: 2,
    isExample: true,
  },
  {
    id: "tl-dts",
    kind: "education",
    title: {
      fr: "DTS — Diplôme de Technicien Supérieur en informatique",
      en: "DTS — Higher Technician Diploma in computer science",
    },
    organization: "IAI Cameroun",
    location: "Yaoundé",
    startDate: "2023-10",
    endDate: "2025-07",
    description: {
      fr: "Deux années de fondamentaux : algorithmique, programmation, bases de données, réseaux, systèmes d'exploitation et génie logiciel.",
      en: "Two years of fundamentals: algorithms, programming, databases, networking, operating systems and software engineering.",
    },
    sortOrder: 3,
    isExample: true,
  },
  {
    id: "tl-internship",
    kind: "experience",
    title: {
      fr: "Stage académique — administration réseau (exemple à compléter)",
      en: "Academic internship — network administration (example to complete)",
    },
    organization: "Structure d'accueil à renseigner",
    location: "Cameroun",
    startDate: "2025-07",
    endDate: "2025-09",
    description: {
      fr: "Remplacez cette entrée par vos stages réels depuis /admin → Parcours : missions, outils utilisés, résultats observés.",
      en: "Replace this entry with your real internships from /admin → Journey: tasks, tools used, observed outcomes.",
    },
    sortOrder: 4,
    isExample: true,
  },
];
