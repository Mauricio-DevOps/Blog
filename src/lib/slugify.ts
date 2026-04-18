import type { Field } from 'payload'

export function formatSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createSlugField(sourceField: string): Field {
  return {
    name: 'slug',
    type: 'text',
    admin: {
      position: 'sidebar',
    },
    hooks: {
      beforeValidate: [
        ({ data, value }) => {
          if (typeof value === 'string' && value.trim()) {
            return formatSlug(value)
          }

          const candidate = data?.[sourceField]

          if (typeof candidate === 'string') {
            return formatSlug(candidate)
          }

          return value
        },
      ],
    },
    index: true,
    required: true,
    unique: true,
  }
}
