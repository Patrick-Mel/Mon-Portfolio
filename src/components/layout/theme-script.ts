export const THEME_STORAGE_KEY = "theme";

/**
 * Script exécuté avant le premier rendu : applique le thème mémorisé, sinon le
 * thème par défaut de l'admin, sinon la préférence système. Aucun flash.
 */
export function themeScript(defaultTheme: "system" | "light" | "dark") {
  return `(function(){try{var d=document.documentElement,s=localStorage.getItem("${THEME_STORAGE_KEY}"),f=${JSON.stringify(
    defaultTheme,
  )};var t=(s==="light"||s==="dark")?s:(f!=="system"?f:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"));d.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="light";}})();`;
}
