export const DEFAULT_SITE_THEME = 'dark' as const
export const SITE_THEME_STORAGE_KEY = 'nebulosa-theme'

export type SiteTheme = 'dark' | 'light'

export function normalizeSiteTheme(value?: null | string): SiteTheme {
  return value === 'light' ? 'light' : DEFAULT_SITE_THEME
}

export const siteThemeInitScript = `(() => {
  try {
    const theme = localStorage.getItem('${SITE_THEME_STORAGE_KEY}') === 'light' ? 'light' : '${DEFAULT_SITE_THEME}';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = '${DEFAULT_SITE_THEME}';
    document.documentElement.style.colorScheme = '${DEFAULT_SITE_THEME}';
  }
})();`
