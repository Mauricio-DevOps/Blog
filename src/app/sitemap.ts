import type { MetadataRoute } from 'next'

import { getSitemapCollections } from '@/lib/queries'
import { getSiteURL, staticPagePaths } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteURL()
  const { posts, tags, sections } = await getSitemapCollections()

  const staticPages: MetadataRoute.Sitemap = staticPagePaths.map((path) => ({
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    lastModified: new Date(),
    priority: path === '/' ? 1 : 0.7,
    url: `${siteUrl}${path}`,
  }))

  const sectionPages: MetadataRoute.Sitemap = sections.map((section) => ({
    changeFrequency: 'weekly',
    lastModified: section.updatedAt ? new Date(section.updatedAt) : new Date(),
    priority: 0.8,
    url: `${siteUrl}/${section.slug}`,
  }))

  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    changeFrequency: 'weekly',
    lastModified: tag.updatedAt ? new Date(tag.updatedAt) : new Date(),
    priority: 0.6,
    url: `${siteUrl}/tag/${tag.slug}`,
  }))

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    changeFrequency: 'weekly',
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    priority: 0.9,
    url: `${siteUrl}/post/${post.slug}`,
  }))

  return [...staticPages, ...sectionPages, ...tagPages, ...postPages]
}
