import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { createSlugField } from '@/lib/slugify'

function validateHexTone(value: unknown) {
  const normalized = String(value || '').trim()

  if (!normalized) {
    return 'A cor do accent é obrigatória.'
  }

  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
    return 'Use um hex válido, por exemplo #c04f34.'
  }

  return true
}

export const Accents: CollectionConfig = {
  slug: 'accents',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'tone', 'updatedAt'],
    useAsTitle: 'title',
  },
  defaultSort: 'title',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    createSlugField('title'),
    {
      name: 'tone',
      type: 'text',
      required: true,
      validate: validateHexTone,
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
