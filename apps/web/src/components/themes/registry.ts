export const themes = [
  { id: 'original', name: 'Original', description: 'The original Darelife. After dark, in red.', colors: ['#090909', '#ef4444', '#e3e3e3'] },
  { id: 'sketchbook', name: 'Sketchbook', description: 'Ideas on paper. A little color, a little chaos.', colors: ['#f7f2e6', '#284bc1', '#f5cf54'] },
] as const;

export type ThemeId = (typeof themes)[number]['id'];
export const THEME_STORAGE_KEY = 'daredev-theme';
export const isThemeId = (value: unknown): value is ThemeId => themes.some(theme => theme.id === value);

// Runs before first paint. Keep validation consistent with the registry.
export const themeBootstrap = `(()=>{try{const t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});document.documentElement.dataset.theme=${JSON.stringify(themes.map(t => t.id))}.includes(t)?t:'original'}catch{document.documentElement.dataset.theme='original'}})()`;
