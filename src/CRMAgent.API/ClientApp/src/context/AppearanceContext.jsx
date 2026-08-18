import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const ACCENT_HEX = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#22c55e',
  orange: '#f59e0b',
  red: '#ef4444',
  pink: '#ec4899',
  teal: '#14b8a6',
  indigo: '#6366f1'
};

/** Gradient end colors (matches previous Settings preview gradients). */
export const ACCENT_DARK_HEX = {
  blue: '#9333ea',
  purple: '#db2777',
  green: '#0d9488',
  orange: '#dc2626',
  red: '#db2777',
  pink: '#7c3aed',
  teal: '#16a34a',
  indigo: '#7c3aed'
};

const FONT_SIZE_PX = {
  small: '14px',
  medium: '16px',
  large: '18px'
};

const STORAGE = {
  theme: 'appearance_theme',
  accent: 'appearance_accent',
  fontSize: 'appearance_fontSize',
  sidebarCollapsed: 'appearance_sidebarCollapsed',
  animations: 'appearance_animations'
};

const DEFAULTS = {
  theme: 'dark',
  accentColor: 'blue',
  fontSize: 'medium',
  sidebarCollapsed: false,
  animations: true
};

function readString(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function readBool(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    return value === 'true';
  } catch {
    return fallback;
  }
}

function applyThemeClass(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
    root.classList.toggle('light', !prefersDark);
  }
}

function applyAccentVars(accentColor) {
  const hex = ACCENT_HEX[accentColor] || ACCENT_HEX.blue;
  const dark = ACCENT_DARK_HEX[accentColor] || ACCENT_DARK_HEX.blue;
  const root = document.documentElement;
  root.style.setProperty('--accent-color', hex);
  root.style.setProperty('--accent-color-dark', dark);
  root.style.setProperty('--accent-color-shadow', `${hex}40`);
}

function applyFontSize(fontSize) {
  document.documentElement.style.setProperty(
    '--app-font-size',
    FONT_SIZE_PX[fontSize] || FONT_SIZE_PX.medium
  );
  document.documentElement.style.fontSize = FONT_SIZE_PX[fontSize] || FONT_SIZE_PX.medium;
}

const AppearanceContext = createContext(null);

export function AppearanceProvider({ children }) {
  const [theme, setThemeState] = useState(() =>
    readString(STORAGE.theme, DEFAULTS.theme)
  );
  const [accentColor, setAccentColorState] = useState(() =>
    readString(STORAGE.accent, DEFAULTS.accentColor)
  );
  const [fontSize, setFontSizeState] = useState(() =>
    readString(STORAGE.fontSize, DEFAULTS.fontSize)
  );
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() =>
    readBool(STORAGE.sidebarCollapsed, DEFAULTS.sidebarCollapsed)
  );
  const [animations, setAnimationsState] = useState(() =>
    readBool(STORAGE.animations, DEFAULTS.animations)
  );

  const setTheme = useCallback((value) => {
    try {
      localStorage.setItem(STORAGE.theme, value);
    } catch { /* ignore */ }
    applyThemeClass(value);
    setThemeState(value);
  }, []);

  const setAccentColor = useCallback((value) => {
    try {
      localStorage.setItem(STORAGE.accent, value);
    } catch { /* ignore */ }
    applyAccentVars(value);
    setAccentColorState(value);
  }, []);

  const setFontSize = useCallback((value) => {
    try {
      localStorage.setItem(STORAGE.fontSize, value);
    } catch { /* ignore */ }
    applyFontSize(value);
    setFontSizeState(value);
  }, []);

  const setSidebarCollapsed = useCallback((value) => {
    setSidebarCollapsedState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem(STORAGE.sidebarCollapsed, String(next));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const setAnimations = useCallback((value) => {
    setAnimationsState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem(STORAGE.animations, String(next));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Ensure CSS vars are applied on first paint from stored state
  useEffect(() => {
    applyThemeClass(theme);
    applyAccentVars(accentColor);
    applyFontSize(fontSize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (theme !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyThemeClass('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const resetAppearance = useCallback(() => {
    Object.values(STORAGE).forEach((key) => {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
    });
    try {
      localStorage.setItem(STORAGE.theme, DEFAULTS.theme);
      localStorage.setItem(STORAGE.accent, DEFAULTS.accentColor);
      localStorage.setItem(STORAGE.fontSize, DEFAULTS.fontSize);
      localStorage.setItem(STORAGE.sidebarCollapsed, String(DEFAULTS.sidebarCollapsed));
      localStorage.setItem(STORAGE.animations, String(DEFAULTS.animations));
    } catch { /* ignore */ }
    applyThemeClass(DEFAULTS.theme);
    applyAccentVars(DEFAULTS.accentColor);
    applyFontSize(DEFAULTS.fontSize);
    setThemeState(DEFAULTS.theme);
    setAccentColorState(DEFAULTS.accentColor);
    setFontSizeState(DEFAULTS.fontSize);
    setSidebarCollapsedState(DEFAULTS.sidebarCollapsed);
    setAnimationsState(DEFAULTS.animations);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      accentColor,
      fontSize,
      sidebarCollapsed,
      animations,
      setTheme,
      setAccentColor,
      setFontSize,
      setSidebarCollapsed,
      setAnimations,
      resetAppearance,
      accentHex: ACCENT_HEX[accentColor] || ACCENT_HEX.blue,
      accentDarkHex: ACCENT_DARK_HEX[accentColor] || ACCENT_DARK_HEX.blue
    }),
    [
      theme,
      accentColor,
      fontSize,
      sidebarCollapsed,
      animations,
      setTheme,
      setAccentColor,
      setFontSize,
      setSidebarCollapsed,
      setAnimations,
      resetAppearance
    ]
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    throw new Error('useAppearance must be used within AppearanceProvider');
  }
  return ctx;
}
