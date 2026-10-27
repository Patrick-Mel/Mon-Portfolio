#!/usr/bin/env node
/**
 * Crée (ou promeut) le compte propriétaire de l'administration.
 * Les inscriptions publiques étant désactivées, c'est la SEULE façon de créer un admin.
 *
 * Usage :
 *   pnpm admin:create votre@email.com
 *   (le mot de passe est demandé de façon masquée, ou lu dans ADMIN_PASSWORD)
 *
 * Nécessite NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import { stdin, stdout } from "node:process";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();

if (!url || !key) {
  console.error("✗ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (.env.local).");
  process.exit(1);
}
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error("✗ Usage : pnpm admin:create votre@email.com");
  process.exit(1);
}

/** Saisie masquée du mot de passe dans le terminal. */
function askHidden(question) {
  return new Promise((resolve) => {
    stdout.write(question);
    let value = "";
    if (!stdin.isTTY) {
      stdin.once("data", (d) => resolve(String(d).trim()));
      return;
    }
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (ch) => {
      if (ch === "\r" || ch === "\n" || ch === "\u0004") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.off("data", onData);
        stdout.write("\n");
        resolve(value);
      } else if (ch === "\u0003") {
        process.exit(130);
      } else if (ch === "\u007f") {
        value = value.slice(0, -1);
      } else {
        value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

const password = process.env.ADMIN_PASSWORD || (await askHidden("Mot de passe (16 caractères minimum recommandés) : "));
if (password.length < 12) {
  console.error("✗ Mot de passe trop court (12 caractères minimum).");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

let userId;
const { data: created, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
if (error) {
  // Compte existant : on le retrouve et on met à jour son mot de passe.
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users.find((u) => u.email?.toLowerCase() === email);
  if (listErr || !existing) {
    console.error(`✗ Création impossible : ${error.message}`);
    process.exit(1);
  }
  userId = existing.id;
  await supabase.auth.admin.updateUserById(userId, { password, email_confirm: true });
  console.log("• Compte existant : mot de passe mis à jour.");
} else {
  userId = created.user.id;
  console.log("• Compte créé.");
}

const { error: adminErr } = await supabase.from("admins").upsert({ user_id: userId });
if (adminErr) {
  console.error(`✗ Ajout à public.admins impossible : ${adminErr.message} (migrations exécutées ?)`);
  process.exit(1);
}
console.log(`✓ ${email} est administrateur. Connectez-vous sur /admin, puis activez la double authentification.`);
