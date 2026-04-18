import type { Metadata } from 'next'

import { SectionArchive } from '@/components/site/SectionArchive'
import { getSectionBySlug } from '@/lib/queries'
import { readSearchParam } from '@/lib/request'
import { getAbsoluteURL, siteConfig } from '@/lib/site'

const slug = 'games'

type Props = {
  searchParams: Promise<{
    newsletter?: string | string[]
    page?: string | string[]
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  const section = await getSectionBySlug(slug)

  return {
    alternates: {
      canonical: getAbsoluteURL(`/${slug}`),
    },
    description: section?.description || siteConfig.description,
    title: section?.title || 'Games',
  }
}

export default async function GamesPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Number(readSearchParam(params.page) || '1')

  return <SectionArchive newsletterStatus={readSearchParam(params.newsletter)} page={page} slug={slug} />
}
