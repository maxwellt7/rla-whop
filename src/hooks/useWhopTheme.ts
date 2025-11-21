import { useEffect } from 'react';

const DARK_CLASS = 'dark';

const resolveExplicitTheme = (theme?: string | null) => {
  if (!theme) {
    return null;
  }
  const normalized = theme.toLowerCase();
  if (normalized === 'dark' || normalized === 'light') {
    return normalized;
  }
  return null;
};

const readWhopThemeAttribute = () => {
  if (typeof document === 'undefined') {
    return null;
  }

  const bodyTheme = document.body?.dataset?.theme;
  const htmlTheme = document.documentElement?.dataset?.theme;

  return resolveExplicitTheme(bodyTheme || htmlTheme);
};

const prefersDark = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyThemeClass = (theme: 'light' | 'dark') => {
  if (typeof document === 'undefined') {
    return;
  }
  if (theme === 'dark') {
    document.documentElement.classList.add(DARK_CLASS);
  } else {
    document.documentElement.classList.remove(DARK_CLASS);
  }
};

const deriveTheme = (explicitTheme?: string | null) => {
  const normalized = resolveExplicitTheme(explicitTheme);
  if (normalized) {
    return normalized;
  }
  return prefersDark() ? 'dark' : 'light';
};

export const useWhopTheme = () => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncTheme = (incomingTheme?: string | null) => {
      applyThemeClass(deriveTheme(incomingTheme || readWhopThemeAttribute()));
    };

    syncTheme(readWhopThemeAttribute());

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (event: MediaQueryListEvent) => {
      applyThemeClass(event.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    const themeObserver = new MutationObserver(() => {
      syncTheme(readWhopThemeAttribute());
    });

    const observerTarget = document.body || document.documentElement;
    if (observerTarget) {
      themeObserver.observe(observerTarget, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    }

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') {
        return;
      }
      const theme =
        data.whopTheme ||
        data.theme ||
        data?.payload?.theme ||
        data?.payload?.whopTheme ||
        data?.settings?.theme;

      if (typeof theme === 'string') {
        const normalized = resolveExplicitTheme(theme);
        if (normalized) {
          applyThemeClass(normalized);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      themeObserver.disconnect();
      window.removeEventListener('message', handleMessage);
    };
  }, []);
};

