import type { Metadata } from 'next'

import { SectionArchive } from '@/components/site/SectionArchive'
import { getSectionBySlug } from '@/lib/queries'
import { readSearchParam } from '@/lib/request'
import { getAbsoluteURL, siteConfig } from '@/lib/site'

type Props = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    newsletter?: string | string[]
    page?: string | string[]
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const section = await getSectionBySlug(slug)

  return {
    alternates: {
      canonical: getAbsoluteURL(`/${slug}`),
    },
    description: section?.description || siteConfig.description,
    title: section?.title || 'Seção',
  }
}

export default async function SectionPage({ params, searchParams }: Props) {
  const { slug } = await params
  const query = await searchParams
  const page = Number(readSearchParam(query.page) || '1')

  return <SectionArchive newsletterStatus={readSearchParam(query.newsletter)} page={page} slug={slug} />
}
