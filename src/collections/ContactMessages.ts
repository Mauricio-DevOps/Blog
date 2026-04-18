import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

const contactSubjects = [
  { label: 'Geral', value: 'geral' },
  { label: 'Patrocinio', value: 'patrocinio' },
  { label: 'Parceria', value: 'parceria' },
  { label: 'Pauta', value: 'pauta' },
  { label: 'Sugestao', value: 'sugestao' },
  { label: 'Outro', value: 'outro' },
] as const

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  access: {
    create: () => true,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['name', 'email', 'subject', 'status', 'updatedAt'],
    useAsTitle: 'name',
  },
  defaultSort: '-updatedAt',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'subject',
      type: 'select',
      defaultValue: 'geral',
      options: [...contactSubjects],
      required: true,
    },
    {
      name: 'origin',
      type: 'text',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        {
          label: 'Novo',
          value: 'new',
        },
        {
          label: 'Em andamento',
          value: 'in_progress',
        },
        {
          label: 'Resolvido',
          value: 'resolved',
        },
      ],
      required: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) {
          return data
        }

        return {
          ...data,
          email: typeof data.email === 'string' ? data.email.trim().toLowerCase() : data.email,
          name: typeof data.name === 'string' ? data.name.trim() : data.name,
          origin: typeof data.origin === 'string' ? data.origin.trim() : data.origin,
          phone: typeof data.phone === 'string' ? data.phone.trim() : data.phone,
        }
      },
    ],
  },
}
