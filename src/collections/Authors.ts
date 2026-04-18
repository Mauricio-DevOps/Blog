import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { createSlugField } from '@/lib/slugify'

export const Authors: CollectionConfig = {
  slug: 'authors',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['name', 'expertise', 'updatedAt'],
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
      name: 'expertise',
      type: 'text',
      required: true,
    },
    {
      name: 'bio',
      type: 'textarea',
      required: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
