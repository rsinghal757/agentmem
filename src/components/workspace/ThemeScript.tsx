export const THEME_STORAGE_KEY = "gizznote-theme";

/**
 * Applies the stored theme before first paint so the warm page never flashes
 * ahead of the dark one.
 */
export function ThemeScript() {
  const script = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
    THEME_STORAGE_KEY,
  )});var t=s==="dark"||s==="light"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
