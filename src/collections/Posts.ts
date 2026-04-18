import type { CollectionConfig } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { isAdmin } from '@/access/isAdmin'
import { isAdminOrPublished } from '@/access/isAdminOrPublished'
import { UploadReorderFeature } from '@/components/admin/lexical/UploadReorderFeature'
import { createSlugField } from '@/lib/slugify'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrPublished,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['title', 'status', 'postType', 'publishedAt'],
    useAsTitle: 'title',
  },
  defaultSort: '-publishedAt',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    createSlugField('title'),
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        components: {
          Field: '@/components/admin/ContentJSONImporter#ContentJSONField',
        },
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            UploadFeature({
              enabledCollections: ['media'],
            }),
            UploadReorderFeature(),
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            HorizontalRuleFeature(),
          ]
        },
      }),
      required: true,
    },
    {
      name: 'coverImage',
      label: 'Imagem de capa',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'section',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      relationTo: 'sections',
      required: true,
    },
    {
      name: 'tags',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'tags',
    },
    {
      name: 'author',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      relationTo: 'authors',
      required: true,
    },
    {
      name: 'postType',
      type: 'select',
      admin: {
        position: 'sidebar',
      },
      defaultValue: 'explicador',
      options: [
        {
          label: 'Explicador',
          value: 'explicador',
        },
        {
          label: 'Novidade',
          value: 'novidade',
        },
        {
          label: 'Curiosidade',
          value: 'curiosidade',
        },
        {
          label: 'Lista',
          value: 'lista',
        },
        {
          label: 'Review',
          value: 'review',
        },
      ],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      admin: {
        position: 'sidebar',
      },
      defaultValue: 'draft',
      options: [
        {
          label: 'Rascunho',
          value: 'draft',
        },
        {
          label: 'Publicado',
          value: 'published',
        },
      ],
      required: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
      defaultValue: false,
    },
    {
      name: 'affiliateDisclosure',
      type: 'checkbox',
      admin: {
        description: 'Exibe um aviso editorial quando o post contiver links afiliados ou recomendação patrocinável.',
        position: 'sidebar',
      },
      defaultValue: false,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData?.status === 'published' && !value) {
              return new Date().toISOString()
            }

            return value
          },
        ],
      },
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'posts',
    },
    {
      name: 'seoTitle',
      type: 'text',
    },
    {
      name: 'seoDescription',
      type: 'textarea',
    },
  ],
}
