import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { createSlugField } from '@/lib/slugify'

export const Sections: CollectionConfig = {
  slug: 'sections',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'accent', 'updatedAt'],
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
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'accent',
      relationTo: 'accents',
      type: 'relationship',
      required: true,
    },
  ],
}
