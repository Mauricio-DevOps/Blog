export const siteConfig = {
  contactEmail: 'editorial@nebulosapop.local',
  description:
    'Explicações, novidades e curiosidades de cultura pop em PT-BR para quem quer entender antes de maratonar.',
  name: 'Nebulosa Pop',
  shortName: 'Nebulosa',
  tagline: 'Cultura pop sem complicação para iniciantes curiosos.',
} as const

export const sectionOrder = ['filmes', 'series', 'animes', 'games'] as const

export const sectionLabels: Record<string, string> = {
  animes: 'Animes',
  filmes: 'Filmes',
  games: 'Games',
  series: 'Séries',
}

export const postTypeLabels: Record<string, string> = {
  curiosidade: 'Curiosidade',
  explicador: 'Explicador',
  lista: 'Lista',
  novidade: 'Novidade',
  review: 'Review',
}

export const staticPagePaths = ['/', '/sobre', '/contato'] as const

export function getSiteURL() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export function getAbsoluteURL(pathname = '/') {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${getSiteURL()}${normalizedPath}`
}
