# Guide d'utilisation

Ce guide explique, étape par étape, comment mettre le site en ligne puis le faire vivre au quotidien.
Les aspects techniques (variables, dépannage) sont détaillés dans le [README](../README.md).

---

## 1. Comprendre le fonctionnement

Le site a deux parties :

| Partie | Adresse | Pour qui |
| --- | --- | --- |
| **Site public** | `https://votre-domaine/fr` et `/en` | recruteurs, clients, visiteurs |
| **Administration** | `https://votre-domaine/admin` | vous seul |

Il fonctionne dans deux modes :

- **Sans base de données** (juste après installation) : le site public affiche le contenu d'exemple rangé dans `src/content/`. Les formulaires ne peuvent rien enregistrer et `/admin` affiche les étapes de configuration.
- **Avec Supabase** (mode normal) : tout le contenu vient de la base, vous le modifiez dans `/admin`, et chaque enregistrement met le site à jour automatiquement en quelques secondes. **Vous n'avez plus besoin de toucher au code pour le contenu.**

## 2. Lancer le site sur votre ordinateur

1. Installez Node.js 24 (nodejs.org).
2. Dans un terminal, placé dans le dossier du projet :
   ```bash
   corepack enable
   pnpm install
   pnpm dev
   ```
3. Ouvrez http://localhost:3000. Arrêtez le serveur avec `Ctrl + C`.

## 3. Mettre le site en ligne (à faire une seule fois)

### 3.1 Créer la base Supabase
1. Créez un compte sur supabase.com → **New project**. Choisissez un mot de passe de base solide et une région proche (Europe de l'Ouest).
2. Menu **SQL Editor** → **New query**. Copiez-collez le contenu de chaque fichier ci-dessous, **dans cet ordre**, puis cliquez **Run** après chacun :
   1. `supabase/migrations/20261027000100_schema.sql`
   2. `supabase/migrations/20261027000200_rls.sql`
   3. `supabase/migrations/20261027000300_functions_storage.sql`
   4. `supabase/seed.sql`
3. Exécutez aussi `supabase/tests/rls.test.sql` : le message **« ✓ RLS : tous les contrôles sont passés »** doit s'afficher. Il confirme que vos données privées sont protégées.
4. **Authentication → Providers → Email** : décochez **Allow new users to sign up** puis enregistrez. Personne d'autre que vous ne pourra créer de compte.
5. **Project Settings → API** : notez l'**URL**, la clé **anon** et la clé **service_role** (cette dernière est secrète).

### 3.2 Renseigner les clés en local
1. Copiez `.env.example` en `.env.local`.
2. Collez l'URL et les deux clés Supabase.
3. Générez un sel secret et collez-le dans `HASH_SALT` :
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Relancez `pnpm dev`.

### 3.3 Créer votre compte administrateur
```bash
pnpm admin:create votre@email.com
```
Le terminal demande un mot de passe (rien ne s'affiche pendant la saisie, c'est normal). Utilisez au moins 16 caractères, stockés dans un gestionnaire de mots de passe.

### 3.4 Déployer sur Vercel
1. Créez un compte sur vercel.com en vous connectant avec GitHub.
2. **Add New → Project** → importez le dépôt `Mon-Portfolio`.
3. Dans **Environment Variables**, ajoutez les mêmes variables que dans `.env.local`, avec `NEXT_PUBLIC_SITE_URL` = l'adresse Vercel (ex. `https://mon-portfolio.vercel.app`) ou votre futur domaine.
4. **Deploy**. Une minute plus tard, le site est en ligne.
5. Ensuite, **chaque `git push` sur la branche `main` redéploie automatiquement le site.**

### 3.5 Brancher votre nom de domaine (facultatif)
1. Achetez le domaine chez un registrar.
2. Vercel → **Settings → Domains** → ajoutez `votredomaine.com` et `www.votredomaine.com`, puis recopiez chez le registrar les enregistrements DNS affichés.
3. Mettez à jour `NEXT_PUBLIC_SITE_URL` sur Vercel, redéployez, puis l'URL dans **/admin → Paramètres** et dans Supabase (**Authentication → URL Configuration → Site URL**).

### 3.6 Activer les e-mails (recommandé)
1. Créez un compte sur resend.com, ajoutez et vérifiez votre domaine (enregistrements DNS fournis).
2. Créez une clé API → `RESEND_API_KEY`, et choisissez l'expéditeur → `EMAIL_FROM` (ex. `Patrick Melaga <contact@votredomaine.com>`).
3. Sans cette étape, les messages sont bien enregistrés dans l'admin mais vous ne recevez pas de notification par e-mail.

## 4. Se connecter à l'administration

1. Allez sur `/admin`, saisissez votre e-mail et votre mot de passe.
2. **Première connexion : activez la double authentification.** Menu **Sécurité (2FA)** → **Activer** → scannez le QR code avec une application (Google Authenticator, Aegis, Microsoft Authenticator…) → saisissez le code à 6 chiffres.
3. Désormais, chaque connexion demandera ce code. Gardez l'application sur votre téléphone.
4. Pour vous déconnecter : icône de sortie en bas du menu latéral.

Sur téléphone, le menu s'ouvre avec le bouton **Menu** en haut à droite.

## 5. Premier passage : remplacer le contenu d'exemple

Le **tableau de bord** affiche un bandeau jaune « X élément(s) contiennent encore du contenu d'exemple ». Chaque élément concerné porte un badge **Exemple** dans les listes. Suivez cet ordre :

### 5.1 Paramètres (le plus important)
Menu **Paramètres** :
- **Identité** : nom, nom de marque, initiales du logo, URL du site, titre professionnel (séparez les rôles par « · »), phrase d'accroche, introduction de l'accueil, présentation, disponibilité, **photo de profil** (portrait vertical).
- **Coordonnées** : e-mail public, téléphone, WhatsApp (chiffres uniquement, ex. `2376XXXXXXXX`), ville.
- **Réseaux sociaux** : collez vos liens complets (`https://…`). Un champ vide masque le réseau.
- **CV** : cliquez **Choisir** → **Téléverser** votre PDF français, puis faites de même pour l'anglais.
- **SEO et partage** : titre et description qui apparaissent dans Google.
- **Apparence** : couleur d'accent et thème par défaut.
- **Fonctionnalités** : activez ou désactivez le blog, les commentaires, la newsletter, les devis, les statistiques.
- Décochez **Contenu d'exemple** puis cliquez **Enregistrer** (barre en bas de l'écran).

Chaque formulaire de l'admin a deux colonnes **FR** et **EN** : remplissez toujours les deux langues.

### 5.2 Parcours
Menu **Parcours** : corrigez les dates (format `AAAA-MM`) et remplacez l'entrée « Stage académique — exemple » par vos vrais stages. Laissez **Fin** vide pour une expérience en cours.

### 5.3 Chiffres clés
Menu **Chiffres clés** : uniquement des faits vérifiables (années d'études, diplômes, projets livrés…).

### 5.4 Compétences, services, projets, articles
Voir les sections suivantes. Pour supprimer un exemple : ouvrez-le → **Supprimer** en haut à droite.

## 6. Gérer les projets

Menu **Projets** → **+ Nouveau projet**, ou cliquez un titre pour le modifier.

1. **Identité** : titre FR/EN, puis cliquez **Générer** à côté du *Slug* (c'est la fin de l'adresse de la page, ex. `/fr/projets/mon-projet`). Choisissez le domaine et écrivez un résumé court (il apparaît sur les cartes).
2. **Publication** :
   - *Statut* **Brouillon** = invisible sur le site ; **Publié** = visible.
   - *Ordre d'affichage* : le plus petit nombre passe en premier.
   - *Mettre en avant* : le projet apparaît sur l'accueil (les 3 premiers mis en avant).
3. **Fiche** : rôle, durée, année, stack technique (séparée par des virgules), liens GitHub/démo (facultatifs, en `https://`), visuel de couverture.
4. **Étude de cas** : Contexte, Problème, Solution, Résultats, Ce que j'ai appris. Utilisez la barre d'outils (gras, titres, listes, code) et l'onglet **Aperçu** pour voir le rendu final.
5. **Schémas interactifs** : vos topologies sous forme de texte JSON (le format est expliqué dans le README, section 8). **L'aperçu se dessine en direct** sous la zone de saisie ; partez d'un schéma d'exemple et modifiez-le.
6. Cliquez **Créer** (ou **Enregistrer**).
7. **Après la création**, en bas de la page du projet : section **Galerie et schémas téléversés** pour ajouter captures d'écran, photos ou schémas exportés (Packet Tracer, draw.io…). Le texte alternatif FR et EN est obligatoire (il sert à l'accessibilité et au référencement). Choisissez « Schéma » pour les placer dans la section Schémas de la page.

Raccourcis dans la liste : cliquez sur le statut pour publier ou dépublier, sur l'étoile pour mettre en avant.

## 7. Écrire sur le blog

Menu **Articles** → **+ Nouvel article**.

1. Titre, slug (**Générer**), catégorie, chapeau (résumé), contenu, image de couverture facultative.
2. **Contenu** en Markdown :
   - `## Titre de section` (alimente automatiquement le sommaire de l'article)
   - `**gras**`, `_italique_`, listes avec `- `
   - blocs de code entre trois accents graves, avec le langage : ` ```bash `
   - liens : `[texte](https://…)`
3. **Publication** :
   - **Brouillon** : invisible.
   - **Publié** : visible immédiatement (la date est remplie automatiquement si vous la laissez vide).
   - **Planifié** + une date future : l'article apparaît tout seul à cette date (au plus tard une heure après).
4. **Tags** : cochez-les en bas du formulaire. Les catégories et tags se gèrent dans **Catégories & tags**.
5. **SEO** (facultatif) : titre et description spécifiques pour Google.

**Annoncer l'article aux abonnés** : menu **Newsletter** → liste « Annoncer un article… » → choisissez l'article → **Pré-remplir** → relisez → **Envoyer la campagne**.

## 8. Services, compétences, pages légales

- **Services** : titre, slug (sert aussi à pré-remplir le formulaire de devis), icône, accroche, description, bénéfices et livrables (**un par ligne**), étapes du processus (bouton **Ajouter une étape**, flèches pour réordonner).
- **Compétences** : nom FR/EN, domaine, niveau (*En progression*, *Opérationnel*, *Avancé* — affiché en barres de signal, jamais en pourcentage), icône. **Compétence clé** = visible sur l'accueil.
- **Pages légales** : mentions légales et politique de confidentialité. Les variables `{{ownerName}}`, `{{contactEmail}}`… sont remplacées automatiquement. Relisez la politique de confidentialité si vous désactivez une fonctionnalité.

## 9. Traiter les demandes

### 9.1 Boîte de réception
Menu **Boîte de réception** (le badge orange indique les nouveautés). Deux onglets : **Messages** (formulaire de contact) et **Devis**.
- Filtrez par statut, ou recherchez par nom, e-mail ou contenu.
- Ouvrir un élément le passe automatiquement en **Lu**.
- Changez le statut au fil du traitement : **En cours** puis **Traité**.
- **Répondre** : écrivez directement dans l'admin (envoi via Resend, le statut passe à « En cours »), ou utilisez **Répondre avec ma messagerie**.
- **Pièces jointes des devis** : cliquez pour télécharger (lien temporaire et sécurisé).
- **Exporter en CSV** : ouvre la liste dans Excel ou Google Sheets.

### 9.2 Commentaires
Menu **Commentaires** → onglet **À modérer**. Aucun commentaire n'apparaît sur le site sans votre clic sur **Approuver**. Vous pouvez aussi **Rejeter**, marquer comme **Spam** ou **Supprimer**. L'e-mail des auteurs n'est jamais publié.

### 9.3 Newsletter
- Les visiteurs s'inscrivent depuis le blog et confirment par e-mail (double opt-in) : seuls les **Confirmés** reçoivent vos campagnes.
- **Nouvelle campagne** : objet, audience (tous, FR ou EN), contenu en Markdown → **Envoyer**. Un lien de désinscription est ajouté automatiquement.
- **Exporter en CSV** pour sauvegarder la liste.

## 10. Médiathèque

Menu **Médiathèque** : glissez-déposez vos fichiers.
- Les images sont automatiquement redimensionnées, converties en WebP (plus légères pour les connexions lentes) et nettoyées de leurs métadonnées.
- Les PDF et SVG sont conservés tels quels (10 Mo maximum).
- Renseignez le **texte alternatif** (description de l'image), copiez l'URL si besoin.
- Dans tous les formulaires, le bouton **Choisir** ouvre cette médiathèque.

## 11. Statistiques

Le **tableau de bord** affiche, sur 7, 30 ou 90 jours : visiteurs uniques, pages vues (avec l'évolution par rapport à la période précédente), courbe quotidienne (survolez une barre pour le détail), pages les plus vues, sources de trafic, pays et appareils.
Ces statistiques n'utilisent aucun cookie : pas de bandeau de consentement à afficher.

## 12. Modifier ce qui n'est pas dans l'admin

Certains éléments se modifient dans le code, puis se publient par un `git push` (Vercel redéploie seul) :

| Élément | Fichier |
| --- | --- |
| Textes fixes de l'interface (boutons, titres de sections, messages d'erreur) | `src/messages/fr.json` et `src/messages/en.json` (mêmes clés dans les deux) |
| Couleurs, rayons, ombres, tailles de texte | `src/app/globals.css`, section « DESIGN TOKENS » |
| Polices | `src/app/fonts.ts` |
| Valeurs par défaut (avant Supabase) | `site.config.ts` |
| Adresses des pages (`/fr/projets`…) | `src/i18n/routing.ts` |

Workflow :
```bash
pnpm dev                      # vérifier en local
pnpm check                    # lint + types + tests + build
git add -A
git commit -m "Mise à jour des textes de l'accueil"
git push
```

## 13. Bonnes pratiques de sécurité

- Gardez la double authentification active ; ne partagez jamais votre mot de passe ni la clé `service_role`.
- Si vous pensez qu'une clé a fuité : régénérez-la dans Supabase (**Project Settings → API**), mettez-la à jour sur Vercel et dans `.env.local`, puis redéployez.
- Consultez de temps en temps le **Journal d'activité** (connexions, suppressions, exports).
- Le fichier `.env.local` ne doit jamais être poussé sur GitHub (il est déjà exclu).

## 14. Questions fréquentes

**Ma modification n'apparaît pas sur le site.** Rechargez la page sans cache (`Ctrl + Maj + R`). Vérifiez que l'élément est en statut *Publié*.

**« Identifiants invalides » alors que le mot de passe est bon.** Relancez `pnpm admin:create votre@email.com`.

**« Trop de tentatives ».** Protection anti-piratage : attendez 15 minutes.

**Je ne reçois pas les e-mails de notification.** Vérifiez `RESEND_API_KEY`, `EMAIL_FROM` et que votre domaine est vérifié chez Resend.

**J'ai perdu mon téléphone (2FA).** Dans Supabase → **Authentication → Users** → votre compte → supprimez le facteur MFA, puis reconnectez-vous et réactivez la 2FA.

**Comment changer de photo ou de CV ?** **Paramètres** → champ concerné → **Choisir** → **Téléverser**.
