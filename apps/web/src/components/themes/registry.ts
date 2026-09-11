export const themes = [
  { id: 'original', name: 'Original', description: 'The original Darelife. After dark, in red.', colors: ['#090909', '#ef4444', '#e3e3e3'] },
  { id: 'sketchbook', name: 'Sketchbook', description: 'Ideas on paper. A little color, a little chaos.', colors: ['#f7f2e6', '#284bc1', '#f5cf54'] },
] as const;

export type ThemeId = (typeof themes)[number]['id'];
export const THEME_STORAGE_KEY = 'daredev-theme';
export const isThemeId = (value: unknown): value is ThemeId => themes.some(theme => theme.id === value);

// Runs before first paint. Keep validation consistent with the registry.
export const themeBootstrap = `(()=>{try{const k=${JSON.stringify(THEME_STORAGE_KEY)},ids=${JSON.stringify(themes.map(t => t.id))},s=sessionStorage.getItem(k),t=ids.includes(s)?s:ids[Math.floor(Math.random()*ids.length)];sessionStorage.setItem(k,t);document.documentElement.dataset.theme=t}catch{document.documentElement.dataset.theme='original'}})()`;
