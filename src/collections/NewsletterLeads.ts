import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const NewsletterLeads: CollectionConfig = {
  slug: 'newsletter-leads',
  access: {
    create: () => true,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['email', 'source', 'status', 'updatedAt'],
    useAsTitle: 'email',
  },
  defaultSort: '-updatedAt',
  labels: {
    plural: 'Leads da newsletter',
    singular: 'Lead da newsletter',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'homepage',
      options: [
        {
          label: 'Homepage',
          value: 'homepage',
        },
        {
          label: 'Post',
          value: 'post',
        },
        {
          label: 'Contato',
          value: 'contato',
        },
      ],
      required: true,
    },
    {
      name: 'interests',
      type: 'select',
      hasMany: true,
      options: [
        {
          label: 'Filmes',
          value: 'filmes',
        },
        {
          label: 'Séries',
          value: 'series',
        },
        {
          label: 'Animes',
          value: 'animes',
        },
        {
          label: 'Games',
          value: 'games',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        {
          label: 'Ativo',
          value: 'active',
        },
        {
          label: 'Pausado',
          value: 'paused',
        },
      ],
      required: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.email) {
          return {
            ...data,
            email: String(data.email).trim().toLowerCase(),
          }
        }

        return data
      },
    ],
  },
}
