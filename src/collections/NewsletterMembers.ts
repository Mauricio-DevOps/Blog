import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

const newsletterInterests = [
  { label: 'Filmes', value: 'filmes' },
  { label: 'Series', value: 'series' },
  { label: 'Animes', value: 'animes' },
  { label: 'Games', value: 'games' },
] as const

export const NewsletterMembers: CollectionConfig = {
  slug: 'newsletter-members',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['email', 'name', 'provider', 'subscriptionStatus', 'updatedAt'],
    useAsTitle: 'email',
  },
  auth: true,
  defaultSort: '-updatedAt',
  labels: {
    plural: 'Newsletter',
    singular: 'Assinante da newsletter',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'provider',
      type: 'select',
      defaultValue: 'local',
      options: [
        {
          label: 'Local',
          value: 'local',
        },
        {
          label: 'Google',
          value: 'google',
        },
        {
          label: 'Microsoft',
          value: 'microsoft',
        },
      ],
      required: true,
    },
    {
      name: 'interests',
      type: 'select',
      hasMany: true,
      options: [...newsletterInterests],
    },
    {
      name: 'source',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'subscriptionStatus',
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
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) {
          return data
        }

        const source = Array.isArray(data.source)
          ? [...new Set(data.source.map((item) => String(item).trim()).filter(Boolean))]
          : data.source

        return {
          ...data,
          email: typeof data.email === 'string' ? data.email.trim().toLowerCase() : data.email,
          name: typeof data.name === 'string' ? data.name.trim() : data.name,
          source,
        }
      },
    ],
  },
}
