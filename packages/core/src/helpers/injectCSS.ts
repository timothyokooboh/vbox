export const injectCSS = (css: string) => {
  if (typeof window === "undefined") return;

  const id = "vbox-theme-tokens";
  let styleEl = document.getElementById(id) as HTMLStyleElement | null;

  if (styleEl) {
    styleEl.textContent += css;
    return;
  }

  styleEl = document.createElement("style");
  styleEl.id = id;
  styleEl.textContent += css;
  document.head.appendChild(styleEl);
};
