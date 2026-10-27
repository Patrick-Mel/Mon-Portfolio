/** CONTENU D'EXEMPLE — offres freelance (modifiables dans /admin → Services). */
import type { Service } from "@/lib/types";

export const services: Service[] = [
  {
    id: "svc-network",
    slug: "reseaux-entreprise",
    icon: "network",
    title: { fr: "Réseaux d'entreprise & interconnexion de sites", en: "Enterprise networks & site interconnection" },
    summary: {
      fr: "Un réseau segmenté, documenté et relié à vos autres sites par VPN, conçu pour durer.",
      en: "A segmented, documented network linked to your other sites over VPN, built to last.",
    },
    description: {
      fr: "De l'audit de l'existant au déploiement, je conçois l'architecture LAN/WAN de votre structure : plan d'adressage, VLAN par usage, routage, Wi-Fi, et interconnexion sécurisée de vos agences par VPN IPsec ou OpenVPN.",
      en: "From auditing what exists to deployment, I design your LAN/WAN architecture: addressing plan, VLANs per use, routing, Wi-Fi, and secure interconnection of your branches over IPsec or OpenVPN.",
    },
    benefits: {
      fr: ["Moins de pannes et de lenteurs grâce à une segmentation claire", "Des agences reliées comme si elles partageaient le même bureau", "Une documentation que votre équipe peut réellement utiliser"],
      en: ["Fewer outages and slowdowns thanks to clear segmentation", "Branches connected as if they shared the same office", "Documentation your team can actually use"],
    },
    deliverables: {
      fr: ["Schéma de topologie et plan d'adressage IP", "Configuration des équipements (routeurs, commutateurs, pare-feu)", "Tunnels VPN site à site testés", "Dossier d'exploitation et procédure de reprise"],
      en: ["Topology diagram and IP addressing plan", "Device configuration (routers, switches, firewalls)", "Tested site-to-site VPN tunnels", "Operations handbook and recovery procedure"],
    },
    process: [
      { title: { fr: "Audit", en: "Audit" }, text: { fr: "Inventaire, mesures et entretien avec vos équipes.", en: "Inventory, measurements and interviews with your team." } },
      { title: { fr: "Conception", en: "Design" }, text: { fr: "Architecture cible, adressage et choix du matériel.", en: "Target architecture, addressing and hardware choices." } },
      { title: { fr: "Déploiement", en: "Rollout" }, text: { fr: "Mise en place par étapes, sans couper l'activité.", en: "Staged rollout without interrupting your business." } },
      { title: { fr: "Transfert", en: "Handover" }, text: { fr: "Documentation, formation et suivi.", en: "Documentation, training and follow-up." } },
    ],
    sortOrder: 1,
    published: true,
    isExample: true,
  },
  {
    id: "svc-servers",
    slug: "administration-serveurs",
    icon: "server",
    title: { fr: "Administration de serveurs Linux & Windows", en: "Linux & Windows server administration" },
    summary: {
      fr: "Des serveurs installés proprement, mis à jour, sauvegardés et faciles à reprendre.",
      en: "Servers installed cleanly, kept up to date, backed up and easy to hand over.",
    },
    description: {
      fr: "Installation et configuration de serveurs Linux (Debian, Ubuntu, Rocky) et Windows Server : Active Directory, DNS, DHCP, partages de fichiers, serveurs web, conteneurs Docker, virtualisation Proxmox et stratégie de sauvegarde.",
      en: "Installation and configuration of Linux (Debian, Ubuntu, Rocky) and Windows Server machines: Active Directory, DNS, DHCP, file shares, web servers, Docker containers, Proxmox virtualization and backup strategy.",
    },
    benefits: {
      fr: ["Des services disponibles quand vos équipes en ont besoin", "Des sauvegardes vérifiées, pas seulement planifiées", "Des tâches répétitives automatisées par script"],
      en: ["Services available when your team needs them", "Backups that are verified, not just scheduled", "Repetitive tasks automated with scripts"],
    },
    deliverables: {
      fr: ["Serveurs installés et configurés", "Scripts d'automatisation commentés", "Plan de sauvegarde et test de restauration", "Fiches d'exploitation"],
      en: ["Installed and configured servers", "Commented automation scripts", "Backup plan and restore test", "Runbooks"],
    },
    process: [
      { title: { fr: "Cadrage", en: "Scoping" }, text: { fr: "Services attendus, contraintes et budget matériel.", en: "Expected services, constraints and hardware budget." } },
      { title: { fr: "Installation", en: "Setup" }, text: { fr: "Systèmes, rôles et services, configurés et testés.", en: "Systems, roles and services, configured and tested." } },
      { title: { fr: "Automatisation", en: "Automation" }, text: { fr: "Mises à jour, sauvegardes et contrôles scriptés.", en: "Scripted updates, backups and checks." } },
      { title: { fr: "Suivi", en: "Support" }, text: { fr: "Maintenance ponctuelle ou régulière selon vos besoins.", en: "One-off or recurring maintenance as you need." } },
    ],
    sortOrder: 2,
    published: true,
    isExample: true,
  },
  {
    id: "svc-security",
    slug: "securite-supervision",
    icon: "shield",
    title: { fr: "Sécurisation & supervision", en: "Security hardening & monitoring" },
    summary: {
      fr: "Voir les problèmes avant vos utilisateurs, et fermer les portes avant les attaquants.",
      en: "Spot problems before your users do, and close doors before attackers find them.",
    },
    description: {
      fr: "Durcissement des systèmes, politique de pare-feu, gestion des accès, mise en place d'une supervision (Zabbix, Grafana) avec alertes utiles et tableaux de bord lisibles.",
      en: "System hardening, firewall policy, access management, and monitoring (Zabbix, Grafana) with useful alerts and readable dashboards.",
    },
    benefits: {
      fr: ["Une surface d'attaque réduite et documentée", "Des alertes qui signalent les vrais problèmes", "Une vision claire de l'état de votre parc"],
      en: ["A reduced, documented attack surface", "Alerts that flag real issues", "A clear view of your infrastructure's health"],
    },
    deliverables: {
      fr: ["Rapport d'audit et plan de remédiation", "Règles de pare-feu et durcissement appliqués", "Supervision configurée avec alertes", "Tableaux de bord Grafana"],
      en: ["Audit report and remediation plan", "Applied firewall rules and hardening", "Configured monitoring with alerts", "Grafana dashboards"],
    },
    process: [
      { title: { fr: "Audit", en: "Audit" }, text: { fr: "Services exposés, comptes, configurations à risque.", en: "Exposed services, accounts, risky configurations." } },
      { title: { fr: "Durcissement", en: "Hardening" }, text: { fr: "Corrections priorisées et appliquées.", en: "Prioritized fixes, applied." } },
      { title: { fr: "Supervision", en: "Monitoring" }, text: { fr: "Sondes, seuils et notifications.", en: "Probes, thresholds and notifications." } },
      { title: { fr: "Revue", en: "Review" }, text: { fr: "Bilan et recommandations de suite.", en: "Wrap-up and next-step recommendations." } },
    ],
    sortOrder: 3,
    published: true,
    isExample: true,
  },
  {
    id: "svc-web",
    slug: "developpement-web",
    icon: "code",
    title: { fr: "Sites & applications web full-stack", en: "Full-stack websites & web apps" },
    summary: {
      fr: "Des sites rapides même sur une connexion lente, et des applications métier sur mesure.",
      en: "Websites that stay fast on slow connections, and custom business applications.",
    },
    description: {
      fr: "Sites vitrines, plateformes et outils internes avec Next.js, React, Django ou Laravel et une base PostgreSQL/MySQL. Je m'occupe aussi de l'hébergement, du nom de domaine et de la mise en production.",
      en: "Showcase sites, platforms and internal tools with Next.js, React, Django or Laravel on a PostgreSQL/MySQL database. I also handle hosting, domain names and going live.",
    },
    benefits: {
      fr: ["Des pages légères, pensées pour le mobile et les réseaux lents", "Un back-office simple pour gérer votre contenu", "Un code propre que d'autres développeurs peuvent reprendre"],
      en: ["Lightweight pages built for mobile and slow networks", "A simple back office to manage your content", "Clean code other developers can pick up"],
    },
    deliverables: {
      fr: ["Maquettes validées", "Application déployée et sécurisée", "Back-office d'administration", "Code source et documentation"],
      en: ["Approved mockups", "Deployed, secured application", "Admin back office", "Source code and documentation"],
    },
    process: [
      { title: { fr: "Atelier", en: "Workshop" }, text: { fr: "Objectifs, utilisateurs et fonctionnalités prioritaires.", en: "Goals, users and priority features." } },
      { title: { fr: "Maquettes", en: "Mockups" }, text: { fr: "Parcours et écrans validés avant le code.", en: "Flows and screens approved before coding." } },
      { title: { fr: "Développement", en: "Build" }, text: { fr: "Livraisons régulières et démonstrations.", en: "Regular releases and demos." } },
      { title: { fr: "Mise en ligne", en: "Launch" }, text: { fr: "Déploiement, formation et maintenance.", en: "Deployment, training and maintenance." } },
    ],
    sortOrder: 4,
    published: true,
    isExample: true,
  },
  {
    id: "svc-design",
    slug: "design-identite-visuelle",
    icon: "palette",
    title: { fr: "Design graphique & identité visuelle", en: "Graphic design & visual identity" },
    summary: {
      fr: "Un logo, une palette et des règles claires pour une image cohérente partout.",
      en: "A logo, a palette and clear rules for a consistent image everywhere.",
    },
    description: {
      fr: "Création de logotypes, chartes graphiques, supports imprimés et numériques, et design d'interfaces dans Figma, avec des fichiers prêts pour l'impression et le web.",
      en: "Logos, brand guidelines, print and digital materials, and interface design in Figma, with files ready for print and web.",
    },
    benefits: {
      fr: ["Une image professionnelle qui inspire confiance", "Des règles simples pour rester cohérent", "Des fichiers sources livrés et réutilisables"],
      en: ["A professional image that builds trust", "Simple rules to stay consistent", "Reusable source files delivered"],
    },
    deliverables: {
      fr: ["Logo et déclinaisons (SVG, PNG, PDF)", "Charte graphique", "Gabarits pour réseaux sociaux et documents", "Maquettes d'interface Figma"],
      en: ["Logo and variants (SVG, PNG, PDF)", "Brand guidelines", "Social media and document templates", "Figma interface mockups"],
    },
    process: [
      { title: { fr: "Brief", en: "Brief" }, text: { fr: "Valeurs, cibles et références.", en: "Values, audiences and references." } },
      { title: { fr: "Pistes", en: "Concepts" }, text: { fr: "Deux à trois directions argumentées.", en: "Two or three reasoned directions." } },
      { title: { fr: "Affinage", en: "Refinement" }, text: { fr: "Itérations sur la piste retenue.", en: "Iterations on the chosen direction." } },
      { title: { fr: "Livraison", en: "Delivery" }, text: { fr: "Fichiers finaux et charte.", en: "Final files and guidelines." } },
    ],
    sortOrder: 5,
    published: true,
    isExample: true,
  },
];
