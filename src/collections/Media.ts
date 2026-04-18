import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'
import { createSlugField } from '@/lib/slugify'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: () => true,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    useAsTitle: 'alt',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    createSlugField('alt'),
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'gallery',
      label: 'Galeria',
      type: 'group',
      admin: {
        description: 'Dimensoes reservadas para a futura galeria dessa imagem.',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'width',
          label: 'Largura (px)',
          type: 'number',
          defaultValue: 1600,
          min: 1,
          required: true,
        },
        {
          name: 'height',
          label: 'Altura (px)',
          type: 'number',
          defaultValue: 900,
          min: 1,
          required: true,
        },
      ],
    },
  ],
  upload: {
    crop: true,
    focalPoint: false,
    imageSizes: [
      {
        fit: 'cover',
        height: 900,
        name: 'galeria',
        position: 'center',
        width: 1600,
      },
    ],
    mimeTypes: ['image/*'],
  },
}
