/**
 * CONTENU D'EXEMPLE — projets présentés en études de cas.
 * Projets académiques plausibles : aucun client, chiffre ou certification inventés.
 * Les champs de récit acceptent du Markdown. Les schémas sont décrits en données
 * (nœuds, liaisons, zones) et rendus en SVG adapté aux deux thèmes.
 */
import type { Project } from "@/lib/types";

const now = "2026-07-15T08:00:00.000Z";

export const projects: Project[] = [
  {
    id: "prj-vpn",
    slug: "interconnexion-vpn-pfsense",
    category: "network",
    title: {
      fr: "Interconnexion de trois sites par VPN IPsec et maquette MPLS",
      en: "Three-site interconnection over IPsec VPN with an MPLS lab",
    },
    summary: {
      fr: "Relier un siège et deux agences avec pfSense, un routage dynamique OSPF et une maquette MPLS L3VPN pour comparer les approches.",
      en: "Connecting a headquarters and two branches with pfSense, dynamic OSPF routing and an MPLS L3VPN lab to compare approaches.",
    },
    context: {
      fr: "Projet académique de troisième année (IAI Cameroun). Le scénario : une PME fictive dispose d'un siège à Yaoundé et de deux agences. Chaque site a son propre accès Internet et ses serveurs locaux ; rien n'est relié.",
      en: "Third-year academic project (IAI Cameroon). The scenario: a fictional SME has a headquarters in Yaoundé and two branches. Each site has its own Internet access and local servers; nothing is connected.",
    },
    problem: {
      fr: "Les équipes s'échangent des fichiers par messagerie, l'annuaire n'est pas partagé et les agences n'accèdent pas à l'application de gestion hébergée au siège. Il faut :\n\n- un accès **chiffré** et permanent entre sites ;\n- un routage qui s'adapte si un lien tombe ;\n- une solution **open source** au budget maîtrisé.",
      en: "Teams exchange files by email, the directory isn't shared, and branches can't reach the management app hosted at headquarters. The requirements:\n\n- **encrypted**, always-on access between sites;\n- routing that adapts when a link fails;\n- an **open-source** solution on a tight budget.",
    },
    solution: {
      fr: "J'ai déployé un pare-feu **pfSense** par site et monté des tunnels **IPsec IKEv2** (AES-256-GCM) en étoile vers le siège. **OSPF** tourne à travers les tunnels pour annoncer automatiquement les réseaux de chaque site. Les VLAN séparent utilisateurs, serveurs et invités.\n\nEn parallèle, j'ai reproduit l'interconnexion sous **GNS3** avec un cœur **MPLS L3VPN** (VRF, MP-BGP) pour comparer la solution « opérateur » à la solution « auto-hébergée ».",
      en: "I deployed one **pfSense** firewall per site and built a hub-and-spoke set of **IPsec IKEv2** tunnels (AES-256-GCM) to headquarters. **OSPF** runs over the tunnels to advertise each site's networks automatically. VLANs separate users, servers and guests.\n\nIn parallel, I rebuilt the interconnection in **GNS3** with an **MPLS L3VPN** core (VRFs, MP-BGP) to compare the carrier approach with the self-hosted one.",
    },
    results: {
      fr: "- Les trois sites communiquent comme un réseau unique, avec des règles de filtrage explicites entre zones.\n- La coupure volontaire d'un lien est détectée par OSPF et le trafic est réacheminé sans intervention.\n- Un dossier d'exploitation (adressage, configurations exportées, procédures) a été rendu avec le projet.",
      en: "- The three sites behave as a single network, with explicit filtering rules between zones.\n- Deliberately cutting a link is detected by OSPF and traffic is rerouted without intervention.\n- An operations handbook (addressing, exported configurations, procedures) was delivered with the project.",
    },
    learnings: {
      fr: "Le MTU et la fragmentation dans les tunnels m'ont coûté une journée : je documente désormais le MSS clamping dès la conception. J'ai aussi appris à présenter un choix technique en termes de coût et de risque pour un décideur non technique.",
      en: "MTU and fragmentation inside the tunnels cost me a full day: I now document MSS clamping from the design stage. I also learned to present a technical choice in terms of cost and risk to a non-technical decision-maker.",
    },
    role: { fr: "Conception, déploiement et documentation", en: "Design, deployment and documentation" },
    year: 2026,
    duration: { fr: "8 semaines", en: "8 weeks" },
    stack: ["pfSense", "IPsec IKEv2", "OSPF", "VLAN 802.1Q", "GNS3", "MPLS L3VPN", "MP-BGP"],
    coverUrl: null,
    githubUrl: null,
    demoUrl: null,
    featured: true,
    status: "published",
    sortOrder: 1,
    diagrams: [
      {
        id: "dg-vpn",
        title: { fr: "Topologie cible : étoile IPsec + OSPF", en: "Target topology: IPsec hub-and-spoke + OSPF" },
        caption: {
          fr: "Les tunnels chiffrés partent des agences vers le siège ; OSPF annonce les réseaux locaux à travers chaque tunnel.",
          en: "Encrypted tunnels run from the branches to headquarters; OSPF advertises local networks across each tunnel.",
        },
        width: 880,
        height: 460,
        zones: [
          { label: { fr: "Siège · 10.10.0.0/16", en: "Headquarters · 10.10.0.0/16" }, x: 300, y: 250, w: 280, h: 190 },
          { label: { fr: "Agence A · 10.20.0.0/16", en: "Branch A · 10.20.0.0/16" }, x: 20, y: 20, w: 240, h: 190 },
          { label: { fr: "Agence B · 10.30.0.0/16", en: "Branch B · 10.30.0.0/16" }, x: 620, y: 20, w: 240, h: 190 },
        ],
        nodes: [
          { id: "inet", label: "Internet", sub: { fr: "FAI", en: "ISP" }, kind: "cloud", x: 440, y: 110 },
          { id: "hq-fw", label: "pfSense HQ", sub: "hub", kind: "firewall", x: 440, y: 300 },
          { id: "hq-srv", label: { fr: "Serveurs", en: "Servers" }, sub: { fr: "AD · fichiers · app", en: "AD · files · app" }, kind: "server", x: 370, y: 395 },
          { id: "hq-lan", label: { fr: "Utilisateurs", en: "Users" }, sub: "VLAN 10", kind: "client", x: 510, y: 395 },
          { id: "a-fw", label: "pfSense A", kind: "firewall", x: 140, y: 75 },
          { id: "a-lan", label: "LAN A", sub: "VLAN 10/20", kind: "switch", x: 140, y: 165 },
          { id: "b-fw", label: "pfSense B", kind: "firewall", x: 740, y: 75 },
          { id: "b-lan", label: "LAN B", sub: "VLAN 10/20", kind: "switch", x: 740, y: 165 },
        ],
        links: [
          { from: "a-fw", to: "inet" },
          { from: "b-fw", to: "inet" },
          { from: "hq-fw", to: "inet" },
          { from: "a-fw", to: "hq-fw", label: "IPsec + OSPF", style: "tunnel" },
          { from: "b-fw", to: "hq-fw", label: "IPsec + OSPF", style: "tunnel" },
          { from: "hq-fw", to: "hq-srv" },
          { from: "hq-fw", to: "hq-lan" },
          { from: "a-fw", to: "a-lan" },
          { from: "b-fw", to: "b-lan" },
        ],
      },
    ],
    images: [],
    seoDescription: null,
    isExample: true,
    updatedAt: now,
  },
  {
    id: "prj-monitoring",
    slug: "supervision-zabbix-grafana",
    category: "systems",
    title: {
      fr: "Supervision d'une infrastructure avec Zabbix et Grafana",
      en: "Infrastructure monitoring with Zabbix and Grafana",
    },
    summary: {
      fr: "Une supervision centralisée des serveurs Linux, Windows et équipements réseau, avec des alertes utiles et des tableaux de bord lisibles.",
      en: "Centralized monitoring of Linux and Windows servers and network gear, with useful alerts and readable dashboards.",
    },
    context: {
      fr: "Travaux pratiques avancés réalisés en binôme sur le laboratoire de l'école : une dizaine de machines virtuelles Proxmox et quelques équipements réseau.",
      en: "Advanced lab work carried out in pairs on the school lab: around ten Proxmox virtual machines and a few network devices.",
    },
    problem: {
      fr: "Les pannes étaient découvertes par les utilisateurs : disque plein, service arrêté, lien saturé. Personne n'avait de vue d'ensemble ni d'historique pour comprendre ce qui s'était passé.",
      en: "Outages were discovered by users: full disks, stopped services, saturated links. Nobody had an overview or the history needed to understand what had happened.",
    },
    solution: {
      fr: "Déploiement d'un serveur **Zabbix** (PostgreSQL) en conteneurs **Docker**, agents Zabbix 2 sur les serveurs, **SNMPv3** pour les équipements réseau. Modèles personnalisés pour les services clés, seuils avec hystérésis pour éviter les fausses alertes, notifications par e-mail et Telegram. **Grafana** affiche une vue « état du parc » et une vue par service.",
      en: "Deployed a **Zabbix** server (PostgreSQL) in **Docker** containers, Zabbix agent 2 on servers, **SNMPv3** for network devices. Custom templates for key services, hysteresis thresholds to avoid false alarms, email and Telegram notifications. **Grafana** shows an infrastructure-health view and a per-service view.",
    },
    results: {
      fr: "- Chaque incident simulé pendant la soutenance (arrêt de service, disque rempli, interface coupée) a déclenché une alerte ciblée.\n- L'historique des métriques permet d'expliquer un incident après coup.\n- L'ensemble se redéploie avec un seul fichier `docker-compose.yml` versionné.",
      en: "- Every incident simulated during the defense (stopped service, filled disk, downed interface) triggered a targeted alert.\n- Metric history makes it possible to explain an incident after the fact.\n- The whole stack redeploys from a single versioned `docker-compose.yml` file.",
    },
    learnings: {
      fr: "Une bonne supervision se juge à ce qu'elle ne signale pas : j'ai passé plus de temps à supprimer du bruit qu'à ajouter des sondes.",
      en: "Good monitoring is judged by what it doesn't report: I spent more time removing noise than adding probes.",
    },
    role: { fr: "Architecture et mise en œuvre (binôme)", en: "Architecture and implementation (pair project)" },
    year: 2025,
    duration: { fr: "5 semaines", en: "5 weeks" },
    stack: ["Zabbix 7", "Grafana", "PostgreSQL", "Docker Compose", "SNMPv3", "Proxmox", "Linux"],
    coverUrl: null,
    githubUrl: null,
    demoUrl: null,
    featured: true,
    status: "published",
    sortOrder: 2,
    diagrams: [
      {
        id: "dg-monitoring",
        title: { fr: "Flux de supervision", en: "Monitoring data flow" },
        caption: {
          fr: "Les agents et SNMP remontent les métriques au serveur Zabbix ; Grafana lit la même base pour les tableaux de bord.",
          en: "Agents and SNMP push metrics to the Zabbix server; Grafana reads the same database for dashboards.",
        },
        width: 880,
        height: 380,
        zones: [{ label: { fr: "Pile Docker", en: "Docker stack" }, x: 330, y: 40, w: 290, h: 300 }],
        nodes: [
          { id: "linux", label: { fr: "Serveurs Linux", en: "Linux servers" }, sub: "agent 2", kind: "server", x: 110, y: 80 },
          { id: "win", label: "Windows Server", sub: "agent 2", kind: "server", x: 110, y: 190 },
          { id: "net", label: { fr: "Équipements réseau", en: "Network devices" }, sub: "SNMPv3", kind: "switch", x: 110, y: 300 },
          { id: "zbx", label: "Zabbix server", kind: "monitor", x: 410, y: 120 },
          { id: "db", label: "PostgreSQL", kind: "database", x: 410, y: 270 },
          { id: "graf", label: "Grafana", kind: "app", x: 545, y: 190 },
          { id: "ops", label: { fr: "Administrateur", en: "Administrator" }, sub: "e-mail · Telegram", kind: "client", x: 770, y: 190 },
        ],
        links: [
          { from: "linux", to: "zbx", label: "10051" },
          { from: "win", to: "zbx" },
          { from: "net", to: "zbx", label: "SNMP", style: "dashed" },
          { from: "zbx", to: "db" },
          { from: "graf", to: "db", style: "dashed" },
          { from: "zbx", to: "ops", label: { fr: "alertes", en: "alerts" } },
          { from: "graf", to: "ops", label: "HTTPS" },
        ],
      },
    ],
    images: [],
    seoDescription: null,
    isExample: true,
    updatedAt: now,
  },
  {
    id: "prj-internships",
    slug: "plateforme-gestion-stages",
    category: "development",
    title: {
      fr: "Plateforme web de gestion des stages",
      en: "Internship management web platform",
    },
    summary: {
      fr: "Une application Django / MySQL pour suivre les offres, candidatures, conventions et évaluations de stage d'une école.",
      en: "A Django / MySQL application to track a school's internship offers, applications, agreements and evaluations.",
    },
    context: {
      fr: "Projet de fin de cycle DTS (exemple). Le suivi des stages reposait sur des tableurs partagés et des échanges d'e-mails entre étudiants, encadreurs et structures d'accueil.",
      en: "End-of-DTS project (example). Internship tracking relied on shared spreadsheets and email threads between students, supervisors and host organizations.",
    },
    problem: {
      fr: "Les informations étaient dispersées, les versions des conventions se multipliaient et il était impossible de savoir rapidement quel étudiant n'avait pas encore de stage.",
      en: "Information was scattered, agreement versions multiplied, and there was no quick way to see which students still had no internship.",
    },
    solution: {
      fr: "Application **Django** avec trois rôles (étudiant, encadreur, administration), base **MySQL** normalisée, génération des conventions en PDF, notifications par e-mail et tableau de bord de suivi. Déploiement sur un serveur Linux derrière **Nginx** et **Gunicorn**, avec HTTPS.",
      en: "A **Django** application with three roles (student, supervisor, administration), a normalized **MySQL** database, PDF agreement generation, email notifications and a tracking dashboard. Deployed on a Linux server behind **Nginx** and **Gunicorn**, with HTTPS.",
    },
    results: {
      fr: "- Un seul endroit pour toutes les pièces d'un stage, avec historique.\n- Un tableau de bord qui répond en un coup d'œil à « qui n'a pas encore de stage ? ».\n- Une démonstration complète présentée au jury.",
      en: "- One place for every internship document, with history.\n- A dashboard that answers “who still has no internship?” at a glance.\n- A complete demo presented to the jury.",
    },
    learnings: {
      fr: "Modéliser les données avec les futurs utilisateurs avant d'écrire du code m'a évité deux refontes. J'ai aussi appris à écrire des tests pour les règles métier plutôt que pour l'interface.",
      en: "Modeling the data with future users before writing code saved me two rewrites. I also learned to test business rules rather than the interface.",
    },
    role: { fr: "Développement full-stack et déploiement", en: "Full-stack development and deployment" },
    year: 2025,
    duration: { fr: "10 semaines", en: "10 weeks" },
    stack: ["Python", "Django", "MySQL", "Nginx", "Gunicorn", "Bootstrap", "Linux"],
    coverUrl: null,
    githubUrl: null,
    demoUrl: null,
    featured: true,
    status: "published",
    sortOrder: 3,
    diagrams: [
      {
        id: "dg-internships",
        title: { fr: "Architecture applicative", en: "Application architecture" },
        caption: {
          fr: "Nginx termine le TLS et sert les fichiers statiques ; Gunicorn exécute Django, qui seul accède à MySQL.",
          en: "Nginx terminates TLS and serves static files; Gunicorn runs Django, the only component that talks to MySQL.",
        },
        width: 880,
        height: 320,
        zones: [{ label: { fr: "Serveur Linux", en: "Linux server" }, x: 250, y: 40, w: 600, h: 240 }],
        nodes: [
          { id: "user", label: { fr: "Navigateur", en: "Browser" }, sub: { fr: "étudiant · encadreur", en: "student · supervisor" }, kind: "client", x: 110, y: 160 },
          { id: "nginx", label: "Nginx", sub: { fr: "TLS · statiques", en: "TLS · static files" }, kind: "router", x: 340, y: 160 },
          { id: "app", label: "Django", sub: "Gunicorn", kind: "app", x: 530, y: 160 },
          { id: "db", label: "MySQL", kind: "database", x: 730, y: 100 },
          { id: "smtp", label: "SMTP", sub: "notifications", kind: "cloud", x: 730, y: 220 },
        ],
        links: [
          { from: "user", to: "nginx", label: "HTTPS" },
          { from: "nginx", to: "app", label: "socket" },
          { from: "app", to: "db" },
          { from: "app", to: "smtp", style: "dashed" },
        ],
      },
    ],
    images: [],
    seoDescription: null,
    isExample: true,
    updatedAt: now,
  },
  {
    id: "prj-identity",
    slug: "identite-visuelle-signal",
    category: "design",
    title: {
      fr: "« Signal » : identité visuelle et design system de ce portfolio",
      en: "“Signal”: visual identity and design system for this portfolio",
    },
    summary: {
      fr: "Un monogramme, une palette, trois typographies et des tokens partagés entre le design et le code.",
      en: "A monogram, a palette, three typefaces and tokens shared between design and code.",
    },
    context: {
      fr: "Projet personnel : créer une identité qui exprime le croisement entre infrastructure et design, sans tomber dans les clichés « hacker ».",
      en: "Personal project: create an identity that expresses the crossover between infrastructure and design without falling into “hacker” clichés.",
    },
    problem: {
      fr: "Comment évoquer les réseaux (nœuds, liaisons, couches) tout en restant sobre, lisible et premium, dans un thème clair comme dans un thème sombre ?",
      en: "How do you evoke networks (nodes, links, layers) while staying restrained, readable and premium, in both a light and a dark theme?",
    },
    solution: {
      fr: "Un **monogramme-nœud** (initiales dans un cadre aux coins coupés, relié par une liaison), une seule couleur de signal orange sur des neutres graphite et papier, l'association **Bricolage Grotesque** / **Instrument Sans** / **JetBrains Mono**, et un étiquetage des sections façon couches réseau. Tout est décrit en **design tokens** (variables CSS) consommés par Tailwind.",
      en: "A **node monogram** (initials in a chamfered frame, attached to a link), a single orange signal color over graphite and paper neutrals, the **Bricolage Grotesque** / **Instrument Sans** / **JetBrains Mono** pairing, and section labels styled like network layers. Everything is described as **design tokens** (CSS variables) consumed by Tailwind.",
    },
    results: {
      fr: "- Contrastes conformes WCAG AA vérifiés dans les deux thèmes.\n- Changement de couleur d'accent possible depuis l'administration, sans toucher au code.\n- Une bibliothèque de composants cohérente utilisée sur tout le site.",
      en: "- WCAG AA contrast verified in both themes.\n- Accent color can be changed from the admin, without touching code.\n- A consistent component library used across the whole site.",
    },
    learnings: {
      fr: "Contraindre la palette à une seule couleur d'accent oblige à travailler la hiérarchie par la typographie et l'espace, ce qui donne un résultat plus durable.",
      en: "Limiting the palette to a single accent forces you to build hierarchy through typography and space, which ages better.",
    },
    role: { fr: "Direction artistique, design et intégration", en: "Art direction, design and front-end" },
    year: 2026,
    duration: { fr: "3 semaines", en: "3 weeks" },
    stack: ["Figma", "Design tokens", "Tailwind CSS", "SVG", "Next.js"],
    coverUrl: null,
    githubUrl: null,
    demoUrl: null,
    featured: false,
    status: "published",
    sortOrder: 4,
    diagrams: [],
    images: [],
    seoDescription: null,
    isExample: true,
    updatedAt: now,
  },
];
