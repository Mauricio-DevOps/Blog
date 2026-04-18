import type { Post, Section } from '@/payload-types'

import { getPayloadClient } from '@/lib/payload'
import { sectionOrder } from '@/lib/site'

function getSectionPriority(slug: string) {
  const index = sectionOrder.indexOf(slug as (typeof sectionOrder)[number])
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

function sortSections(docs: Section[]) {
  return [...docs].sort((left, right) => {
    const leftPriority = getSectionPriority(left.slug)
    const rightPriority = getSectionPriority(right.slug)

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority
    }

    return left.title.localeCompare(right.title, 'pt-BR')
  })
}

export async function getNavigationSections() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'sections',
    depth: 1,
    limit: 20,
    sort: 'title',
  })

  return sortSections(docs)
}

export async function getSectionBySlug(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'sections',
    depth: 1,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return docs[0] || null
}

export async function getTagBySlug(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'tags',
    depth: 0,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return docs[0] || null
}

export async function getPublishedPostBySlug(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    depth: 2,
    limit: 1,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  return docs[0] || null
}

export async function getRelatedPublishedPosts(post: Post, limit = 3) {
  const payload = await getPayloadClient()
  const explicitRelated = Array.isArray(post.relatedPosts)
    ? post.relatedPosts.filter((item): item is Post => Boolean(item && typeof item === 'object'))
    : []

  if (explicitRelated.length > 0) {
    return explicitRelated.filter((item) => item.status === 'published').slice(0, limit)
  }

  if (!post.section || typeof post.section !== 'object') {
    return []
  }

  const { docs } = await payload.find({
    collection: 'posts',
    depth: 2,
    limit,
    sort: '-publishedAt',
    where: {
      and: [
        {
          section: {
            equals: post.section.id,
          },
        },
        {
          slug: {
            not_equals: post.slug,
          },
        },
        {
          status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  return docs
}

export async function getSectionPosts(sectionSlug: string, page = 1, limit = 8) {
  const payload = await getPayloadClient()
  const section = await getSectionBySlug(sectionSlug)

  if (!section) {
    return null
  }

  const posts = await payload.find({
    collection: 'posts',
    depth: 2,
    limit,
    page,
    sort: '-publishedAt',
    where: {
      and: [
        {
          section: {
            equals: section.id,
          },
        },
        {
          status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  return {
    posts,
    section,
  }
}

export async function getTagPosts(tagSlug: string, page = 1, limit = 10) {
  const payload = await getPayloadClient()
  const tag = await getTagBySlug(tagSlug)

  if (!tag) {
    return null
  }

  const posts = await payload.find({
    collection: 'posts',
    depth: 2,
    limit,
    page,
    sort: '-publishedAt',
    where: {
      and: [
        {
          tags: {
            contains: tag.id,
          },
        },
        {
          status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  return {
    posts,
    tag,
  }
}

export async function getHomePageData() {
  const payload = await getPayloadClient()
  const sections = await getNavigationSections()

  const [featuredPosts, latestPosts, editorialPosts, spotlightEntries] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 2,
      limit: 1,
      sort: '-publishedAt',
      where: {
        and: [
          {
            featured: {
              equals: true,
            },
          },
          {
            status: {
              equals: 'published',
            },
          },
        ],
      },
    }),
    payload.find({
      collection: 'posts',
      depth: 2,
      limit: 6,
      sort: '-publishedAt',
      where: {
        status: {
          equals: 'published',
        },
      },
    }),
    payload.find({
      collection: 'posts',
      depth: 2,
      limit: 18,
      sort: '-publishedAt',
      where: {
        and: [
          {
            status: {
              equals: 'published',
            },
          },
          {
            or: [
              {
                postType: {
                  equals: 'explicador',
                },
              },
              {
                postType: {
                  equals: 'curiosidade',
                },
              },
              {
                postType: {
                  equals: 'review',
                },
              },
            ],
          },
        ],
      },
    }),
    Promise.all(
      sections.map(async (section) => {
        const posts = await payload.find({
          collection: 'posts',
          depth: 2,
          limit: 6,
          sort: '-publishedAt',
          where: {
            and: [
              {
                section: {
                  equals: section.id,
                },
              },
              {
                status: {
                  equals: 'published',
                },
              },
            ],
          },
        })

        return {
          posts: posts.docs,
          section,
        }
      }),
    ),
  ])

  const featuredPost = featuredPosts.docs[0] || latestPosts.docs[0] || null

  return {
    editorialPosts: editorialPosts.docs,
    featuredPost,
    latestPosts: latestPosts.docs.filter((post) => post.id !== featuredPost?.id),
    sectionSpotlights: spotlightEntries,
    sections,
  }
}

export async function getSitemapCollections() {
  const payload = await getPayloadClient()

  const [posts, tags, sections] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 100,
      pagination: false,
      sort: '-publishedAt',
      where: {
        status: {
          equals: 'published',
        },
      },
    }),
    payload.find({
      collection: 'tags',
      depth: 0,
      limit: 100,
      pagination: false,
      sort: 'name',
    }),
    payload.find({
      collection: 'sections',
      depth: 1,
      limit: 20,
      pagination: false,
      sort: 'title',
    }),
  ])

  return {
    posts: posts.docs,
    sections: sortSections(sections.docs),
    tags: tags.docs,
  }
}
