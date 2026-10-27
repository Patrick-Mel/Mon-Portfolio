/** CONTENU D'EXEMPLE — articles techniques (Markdown), catégories et tags. */
import type { Category, Post, Tag } from "@/lib/types";

export const categories: Category[] = [
  { id: "cat-network", slug: "reseaux", name: { fr: "Réseaux", en: "Networking" } },
  { id: "cat-systems", slug: "systemes", name: { fr: "Systèmes & sécurité", en: "Systems & security" } },
  { id: "cat-dev", slug: "developpement", name: { fr: "Développement", en: "Development" } },
];

export const tags: Tag[] = [
  { id: "tag-pfsense", slug: "pfsense", name: { fr: "pfSense", en: "pfSense" } },
  { id: "tag-vpn", slug: "vpn", name: { fr: "VPN", en: "VPN" } },
  { id: "tag-linux", slug: "linux", name: { fr: "Linux", en: "Linux" } },
  { id: "tag-security", slug: "securite", name: { fr: "Sécurité", en: "Security" } },
  { id: "tag-nextjs", slug: "nextjs", name: { fr: "Next.js", en: "Next.js" } },
  { id: "tag-postgres", slug: "postgresql", name: { fr: "PostgreSQL", en: "PostgreSQL" } },
];

const cat = (id: string) => categories.find((c) => c.id === id) ?? null;
const tagList = (...ids: string[]) => tags.filter((t) => ids.includes(t.id));

export const posts: Post[] = [
  {
    id: "post-ipsec",
    slug: "vpn-ipsec-site-a-site-pfsense",
    title: {
      fr: "Monter un VPN IPsec site à site avec pfSense, sans se piéger",
      en: "Building a site-to-site IPsec VPN with pfSense, without the usual traps",
    },
    excerpt: {
      fr: "Phase 1, phase 2, routage, MTU : la méthode que j'utilise pour relier deux sites, avec les erreurs qui coûtent le plus de temps.",
      en: "Phase 1, phase 2, routing, MTU: the method I use to connect two sites, and the mistakes that cost the most time.",
    },
    content: {
      fr: `Relier deux sites par un tunnel IPsec est l'un des premiers projets « réels » qu'on confie à un administrateur réseau. pfSense rend l'opération accessible, mais quelques détails font la différence entre un tunnel qui monte et un tunnel qui **tient**.

## Préparer le terrain

Avant de toucher à l'interface, notez sur papier :

- les adresses publiques des deux pare-feu ;
- les réseaux locaux de chaque côté, **sans chevauchement** (par exemple \`10.10.0.0/16\` et \`10.20.0.0/16\`) ;
- les paramètres cryptographiques retenus, identiques des deux côtés.

> Deux sites qui utilisent tous les deux \`192.168.1.0/24\` ne peuvent pas être routés proprement. Renuméroter avant est toujours moins coûteux que bricoler du NAT après.

## Phase 1 : l'identité des pairs

Dans **VPN › IPsec › Tunnels**, créez la phase 1 avec IKEv2, l'adresse publique du pair distant et une clé pré-partagée longue et aléatoire. Pour le chiffrement, AES-256-GCM avec un groupe Diffie-Hellman 14 ou supérieur est un bon choix par défaut.

## Phase 2 : les réseaux à protéger

La phase 2 décrit le trafic qui passe dans le tunnel : réseau local, réseau distant, et les mêmes algorithmes de chaque côté. Activez le PFS.

## Les règles de pare-feu

Le tunnel peut être monté sans qu'aucun paquet ne passe : pfSense bloque par défaut le trafic sur l'interface **IPsec**. Ajoutez des règles explicites, idéalement limitées aux ports réellement nécessaires.

## Le piège du MTU

L'en-tête IPsec réduit la taille utile des paquets. Symptôme typique : le ping passe, mais les pages web ou les partages de fichiers se figent. La correction consiste à limiter le MSS :

\`\`\`text
System › Advanced › Firewall & NAT
  MSS clamping for VPN networks: 1350
\`\`\`

## Vérifier

\`\`\`bash
# depuis un poste du site A
ping -c 4 10.20.0.10
traceroute 10.20.0.10
\`\`\`

Consultez ensuite **Status › IPsec** et les journaux : un tunnel sain affiche des compteurs qui augmentent dans les deux sens.

## Pour aller plus loin

Avec plus de deux sites, faites tourner OSPF dans des tunnels VTI plutôt que de multiplier les phases 2 : chaque nouveau réseau sera annoncé automatiquement.`,
      en: `Connecting two sites with an IPsec tunnel is one of the first “real” projects a network administrator gets. pfSense makes it approachable, but a few details make the difference between a tunnel that comes up and a tunnel that **stays up**.

## Prepare the ground

Before touching the interface, write down:

- the public addresses of both firewalls;
- the local networks on each side, **with no overlap** (for example \`10.10.0.0/16\` and \`10.20.0.0/16\`);
- the chosen cryptographic parameters, identical on both sides.

> Two sites that both use \`192.168.1.0/24\` cannot be routed cleanly. Renumbering first is always cheaper than patching with NAT later.

## Phase 1: peer identity

Under **VPN › IPsec › Tunnels**, create phase 1 with IKEv2, the remote peer's public address and a long, random pre-shared key. AES-256-GCM with Diffie-Hellman group 14 or higher is a sound default.

## Phase 2: the networks to protect

Phase 2 describes which traffic goes through the tunnel: local network, remote network and the same algorithms on both sides. Enable PFS.

## Firewall rules

A tunnel can be up while no packet gets through: pfSense blocks traffic on the **IPsec** interface by default. Add explicit rules, ideally limited to the ports you actually need.

## The MTU trap

The IPsec header reduces the usable packet size. Typical symptom: ping works but web pages or file shares freeze. The fix is to clamp the MSS:

\`\`\`text
System › Advanced › Firewall & NAT
  MSS clamping for VPN networks: 1350
\`\`\`

## Verify

\`\`\`bash
# from a host on site A
ping -c 4 10.20.0.10
traceroute 10.20.0.10
\`\`\`

Then check **Status › IPsec** and the logs: a healthy tunnel shows counters increasing in both directions.

## Going further

With more than two sites, run OSPF over VTI tunnels instead of multiplying phase 2 entries: every new network will be advertised automatically.`,
    },
    coverUrl: null,
    category: cat("cat-network"),
    tags: tagList("tag-pfsense", "tag-vpn", "tag-security"),
    status: "published",
    publishedAt: "2026-05-12T08:00:00.000Z",
    seoTitle: null,
    seoDescription: null,
    isExample: true,
    updatedAt: "2026-05-12T08:00:00.000Z",
  },
  {
    id: "post-hardening",
    slug: "durcir-serveur-ubuntu",
    title: {
      fr: "Durcir un serveur Ubuntu en dix gestes simples",
      en: "Hardening an Ubuntu server in ten simple steps",
    },
    excerpt: {
      fr: "La liste que je déroule sur chaque nouveau serveur avant d'y installer quoi que ce soit.",
      en: "The checklist I go through on every new server before installing anything on it.",
    },
    content: {
      fr: `Un serveur fraîchement installé et exposé sur Internet reçoit des tentatives de connexion en quelques minutes. Voici la liste que je déroule systématiquement.

## 1. Mettre à jour, puis automatiser

\`\`\`bash
sudo apt update && sudo apt full-upgrade -y
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
\`\`\`

## 2. Un utilisateur nominatif, pas root

\`\`\`bash
sudo adduser admin-ops
sudo usermod -aG sudo admin-ops
\`\`\`

## 3. SSH par clé uniquement

Dans \`/etc/ssh/sshd_config\` :

\`\`\`text
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
\`\`\`

Testez la connexion par clé **dans une seconde session** avant de redémarrer le service.

## 4. Un pare-feu qui refuse par défaut

\`\`\`bash
sudo ufw default deny incoming
sudo ufw allow OpenSSH
sudo ufw enable
\`\`\`

## 5. Fail2ban contre la force brute

Fail2ban lit les journaux et bannit temporairement les adresses trop insistantes.

## 6. Supprimer ce qui ne sert pas

\`\`\`bash
ss -tulpn
\`\`\`

Chaque port en écoute doit avoir une raison d'être.

## 7. Synchroniser l'heure

Des journaux horodatés correctement sont indispensables pour comprendre un incident.

## 8. Surveiller l'espace disque et les services

Un disque plein est encore la cause de panne la plus banale. Une supervision simple suffit.

## 9. Sauvegarder… et restaurer

Une sauvegarde jamais restaurée est une hypothèse, pas une sauvegarde.

## 10. Documenter

Notez ce qui a été fait et pourquoi. Votre « moi » de dans six mois vous remerciera.`,
      en: `A freshly installed server exposed to the Internet receives login attempts within minutes. Here is the checklist I always go through.

## 1. Update, then automate

\`\`\`bash
sudo apt update && sudo apt full-upgrade -y
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
\`\`\`

## 2. A named user, not root

\`\`\`bash
sudo adduser admin-ops
sudo usermod -aG sudo admin-ops
\`\`\`

## 3. Key-only SSH

In \`/etc/ssh/sshd_config\`:

\`\`\`text
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
\`\`\`

Test key-based login **in a second session** before restarting the service.

## 4. A deny-by-default firewall

\`\`\`bash
sudo ufw default deny incoming
sudo ufw allow OpenSSH
sudo ufw enable
\`\`\`

## 5. Fail2ban against brute force

Fail2ban reads logs and temporarily bans addresses that insist too much.

## 6. Remove what you don't use

\`\`\`bash
ss -tulpn
\`\`\`

Every listening port needs a reason to exist.

## 7. Sync the clock

Correctly timestamped logs are essential to understand an incident.

## 8. Watch disk space and services

A full disk is still the most mundane cause of outages. Simple monitoring is enough.

## 9. Back up… and restore

A backup that has never been restored is a hypothesis, not a backup.

## 10. Document

Write down what was done and why. Your future self will thank you.`,
    },
    coverUrl: null,
    category: cat("cat-systems"),
    tags: tagList("tag-linux", "tag-security"),
    status: "published",
    publishedAt: "2026-06-03T08:00:00.000Z",
    seoTitle: null,
    seoDescription: null,
    isExample: true,
    updatedAt: "2026-06-03T08:00:00.000Z",
  },
  {
    id: "post-rls",
    slug: "nextjs-supabase-row-level-security",
    title: {
      fr: "Next.js et Supabase : protéger ses données avec la Row Level Security",
      en: "Next.js and Supabase: protecting your data with Row Level Security",
    },
    excerpt: {
      fr: "Pourquoi la sécurité doit vivre dans la base de données, et comment écrire des politiques RLS lisibles.",
      en: "Why security belongs in the database, and how to write readable RLS policies.",
    },
    content: {
      fr: `Avec Supabase, le navigateur parle directement à la base de données. C'est pratique, mais cela signifie qu'une vérification faite **uniquement** dans l'interface ne protège rien.

## Le principe

La Row Level Security (RLS) de PostgreSQL ajoute une condition à chaque requête, selon l'utilisateur qui la fait. Si la condition est fausse, la ligne n'existe tout simplement pas pour lui.

\`\`\`sql
alter table public.messages enable row level security;
\`\`\`

Dès cette ligne exécutée, **plus personne** ne voit rien, sauf les politiques explicites.

## Une fonction pour lire clairement

\`\`\`sql
create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;
\`\`\`

## Des politiques courtes

\`\`\`sql
create policy "lecture publique des articles publiés"
  on public.posts for select
  using (status = 'published' and published_at <= now());

create policy "l'admin gère les articles"
  on public.posts for all
  using (public.is_admin()) with check (public.is_admin());
\`\`\`

## Côté Next.js

Les écritures sensibles passent par des **Server Actions** qui revérifient la session, valident les entrées avec zod, puis appellent Supabase. La clé \`service_role\` reste sur le serveur :

\`\`\`ts
import "server-only";
\`\`\`

Cette simple ligne fait échouer le build si le module est importé par erreur dans un composant client.

## Tester ses politiques

Connectez-vous avec un compte non administrateur et essayez de lire, modifier et supprimer. Ce qui doit échouer doit échouer, et ce test mérite d'être automatisé.`,
      en: `With Supabase, the browser talks directly to the database. That's convenient, but it means a check done **only** in the UI protects nothing.

## The principle

PostgreSQL Row Level Security (RLS) adds a condition to every query based on who runs it. If the condition is false, the row simply doesn't exist for that user.

\`\`\`sql
alter table public.messages enable row level security;
\`\`\`

As soon as this runs, **nobody** sees anything except through explicit policies.

## A helper that reads clearly

\`\`\`sql
create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;
\`\`\`

## Short policies

\`\`\`sql
create policy "public can read published posts"
  on public.posts for select
  using (status = 'published' and published_at <= now());

create policy "admin manages posts"
  on public.posts for all
  using (public.is_admin()) with check (public.is_admin());
\`\`\`

## On the Next.js side

Sensitive writes go through **Server Actions** that re-check the session, validate input with zod, then call Supabase. The \`service_role\` key stays on the server:

\`\`\`ts
import "server-only";
\`\`\`

This single line makes the build fail if the module is accidentally imported into a client component.

## Test your policies

Sign in with a non-admin account and try to read, update and delete. What should fail must fail, and that test is worth automating.`,
    },
    coverUrl: null,
    category: cat("cat-dev"),
    tags: tagList("tag-nextjs", "tag-postgres", "tag-security"),
    status: "published",
    publishedAt: "2026-07-21T08:00:00.000Z",
    seoTitle: null,
    seoDescription: null,
    isExample: true,
    updatedAt: "2026-07-21T08:00:00.000Z",
  },
];
