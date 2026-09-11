'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { isThemeId, themes, THEME_STORAGE_KEY, type ThemeId } from './registry';

type ThemeContextValue = { theme: ThemeId; openThemes: () => void; openShortcuts: () => void };
const ThemeContext = createContext<ThemeContextValue>({ theme: 'original', openThemes: () => {}, openShortcuts: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>('original');
  const committed = useRef<ThemeId>('original');
  const [menu, setMenu] = useState<'themes' | 'shortcuts' | null>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<ThemeId>('original');
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const filtered = themes.filter(t => `${t.name} ${t.description}`.toLowerCase().includes(query.toLowerCase()));

  const apply = useCallback((id: ThemeId) => {
    document.documentElement.dataset.theme = id;
    setTheme(id);
  }, []);

  useEffect(() => {
    const saved = document.documentElement.dataset.theme;
    committed.current = isThemeId(saved) ? saved : 'original';
    apply(committed.current);
    const sync = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
      committed.current = isThemeId(event.newValue) ? event.newValue : 'original';
      if (!dialog.current?.open) apply(committed.current);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [apply]);

  const close = useCallback(() => {
    apply(committed.current);
    setMenu(null);
    dialog.current?.close();
    returnFocus.current?.focus({ preventScroll: true });
  }, [apply]);

  const open = useCallback((next: 'themes' | 'shortcuts') => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery('');
    setActive(committed.current);
    setMenu(next);
  }, []);

  useEffect(() => {
    if (menu && !dialog.current?.open) {
      dialog.current?.showModal();
      dialog.current?.querySelector<HTMLElement>(menu === 'themes' ? '#theme-search' : 'button')?.focus();
    }
  }, [menu]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.isComposing) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), .excalidraw, [data-shortcuts="ignore"]') || dialog.current?.open) {
        return;
      }
      const modifier = event.ctrlKey || event.metaKey;
      // Physical key supports Option+T on layouts where event.key becomes “†”.
      if (event.altKey && !modifier && !event.shiftKey && (event.code === 'KeyT' || event.key.toLowerCase() === 't')) {
        event.preventDefault();
        open('themes');
      } else if (!modifier && !event.altKey && event.key === '?') {
        event.preventDefault();
        open('shortcuts');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const preview = (id: ThemeId) => { setActive(id); apply(id); };
  const confirm = (id: ThemeId) => {
    committed.current = id;
    try { localStorage.setItem(THEME_STORAGE_KEY, id); } catch { /* Selection still works for this visit. */ }
    close();
  };
  const themeShortcut = 'Alt+T';

  return (
    <ThemeContext.Provider value={{ theme, openThemes: () => open('themes'), openShortcuts: () => open('shortcuts') }}>
      {children}
      <div className="theme-tools" aria-label="Appearance and keyboard controls">
        <button type="button" onClick={() => open('themes')} aria-haspopup="dialog" aria-keyshortcuts="Alt+T" title={`Change theme (${themeShortcut})`}><span aria-hidden="true">◐</span> Themes</button>
        <button type="button" onClick={() => open('shortcuts')} aria-haspopup="dialog" aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)">?</button>
      </div>
      <dialog ref={dialog} className="theme-dialog" aria-labelledby="theme-dialog-title"
        onCancel={event => { event.preventDefault(); close(); }}
        onClick={event => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close(); } }}
        onKeyDown={event => {
          if (event.key === 'Tab') {
            const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input, [tabindex="0"]') ?? []);
            const first = items[0]; const last = items[items.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
          }
          if (menu !== 'themes') return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!filtered.length) return;
            const index = filtered.findIndex(t => t.id === active);
            const next = (index + (event.key === 'ArrowDown' ? 1 : -1) + filtered.length) % filtered.length;
            preview(filtered[next].id);
          } else if (event.key === 'Enter' && event.target instanceof HTMLInputElement && filtered.some(t => t.id === active)) {
            event.preventDefault(); confirm(active);
          }
        }}>
        <header><div><span className="theme-eyebrow">MAKE YOURSELF AT HOME</span><h2 id="theme-dialog-title">{menu === 'themes' ? 'Choose your atmosphere' : 'A few handy shortcuts'}</h2></div><button type="button" onClick={close} aria-label="Close dialog">×</button></header>
        {menu === 'themes' ? <>
          <label className="sr-only" htmlFor="theme-search">Search themes</label>
          <input id="theme-search" autoFocus placeholder="Find a theme…" value={query} role="combobox" aria-expanded="true" aria-controls="theme-options" aria-autocomplete="list" aria-activedescendant={filtered.some(t => t.id === active) ? `theme-${active}` : undefined}
            onChange={event => { const value = event.target.value; setQuery(value); const match = themes.find(t => `${t.name} ${t.description}`.toLowerCase().includes(value.toLowerCase())); if (match) preview(match.id); }} />
          <div id="theme-options" role="listbox" aria-label="Themes">{filtered.map(item => <button type="button" id={`theme-${item.id}`} key={item.id} role="option" aria-selected={active === item.id} className="theme-option" onFocus={() => preview(item.id)} onClick={() => confirm(item.id)}>
            <span className="theme-swatches" aria-hidden="true">{item.colors.map(color => <i key={color} style={{ background: color }} />)}</span>
            <span><strong>{item.name}{item.id === committed.current && <small> SELECTED</small>}</strong><span>{item.description}</span></span>
            <span aria-hidden="true">{active === item.id ? '↵' : ''}</span>
          </button>)}</div>
          {!filtered.length && <p className="theme-empty" role="status">No themes found. Try “Sketchbook” or “Original”.</p>}
          <footer>↑ ↓ preview <span>Enter to keep · Esc to cancel</span></footer>
        </> : <>
          <dl className="shortcut-list"><div><dt>Browse themes</dt><dd><kbd>{themeShortcut}</kbd></dd></div><div><dt>Keyboard shortcuts</dt><dd><kbd>?</kbd><small>Shift + / on US keyboards</small></dd></div><div><dt>Preview a theme</dt><dd><kbd>↑</kbd> <kbd>↓</kbd></dd></div><div><dt>Apply theme</dt><dd><kbd>Enter</kbd></dd></div><div><dt>Close / cancel preview</dt><dd><kbd>Esc</kbd></dd></div></dl>
          <p className="theme-empty">Shortcuts pause while you type or use the drawing editor.</p>
        </>}
      </dialog>
    </ThemeContext.Provider>
  );
}
