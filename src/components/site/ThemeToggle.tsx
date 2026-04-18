'use client'

import { useSyncExternalStore } from 'react'

import {
  DEFAULT_SITE_THEME,
  normalizeSiteTheme,
  SITE_THEME_STORAGE_KEY,
  type SiteTheme,
} from '@/lib/theme'

const THEME_CHANGE_EVENT = 'nebulosa-theme-change'

function applyTheme(theme: SiteTheme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

function getThemeSnapshot() {
  if (typeof document === 'undefined') {
    return DEFAULT_SITE_THEME
  }

  return normalizeSiteTheme(document.documentElement.dataset.theme)
}

function subscribeToTheme(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handleThemeChange = () => {
    onStoreChange()
  }

  window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange)

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange)
  }
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M21 12.6A8.6 8.6 0 1 1 11.4 3a7 7 0 1 0 9.6 9.6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6M18.6 5.4l-1.5 1.5M6.9 17.1l-1.5 1.5M18.6 18.6l-1.5-1.5M6.9 6.9 5.4 5.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => DEFAULT_SITE_THEME,
  )

  function handleToggle() {
    const nextTheme: SiteTheme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)

    try {
      window.localStorage.setItem(SITE_THEME_STORAGE_KEY, nextTheme)
    } catch (_error) {
      // Ignore storage failures and keep the in-memory theme switch.
    }

    window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
  }

  const isDark = theme === 'dark'

  return (
    <button
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className="theme-toggle"
      onClick={handleToggle}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      type="button"
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}
