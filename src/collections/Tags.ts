import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { createSlugField } from '@/lib/slugify'

export const Tags: CollectionConfig = {
  slug: 'tags',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['name', 'slug', 'updatedAt'],
    useAsTitle: 'name',
  },
  defaultSort: 'name',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    createSlugField('name'),
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
