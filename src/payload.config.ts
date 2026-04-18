import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  UnderlineFeature,
  lexicalEditor,
  type LinkFields,
} from '@payloadcms/richtext-lexical'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import path from 'path'
import { buildConfig } from 'payload'
import type { TextFieldSingleValidation } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Accents } from '@/collections/Accents'
import { Authors } from '@/collections/Authors'
import { ContactMessages } from '@/collections/ContactMessages'
import { Media } from '@/collections/Media'
import { NewsletterLeads } from '@/collections/NewsletterLeads'
import { NewsletterMembers } from '@/collections/NewsletterMembers'
import { Posts } from '@/collections/Posts'
import { Sections } from '@/collections/Sections'
import { Tags } from '@/collections/Tags'
import { Users } from '@/collections/Users'
import { getDatabaseClientConfig } from '@/lib/database'
import { getSiteURL, siteConfig } from '@/lib/site'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const smtpPort = Number(process.env.SMTP_PORT || '587')
const smtpSecure = process.env.SMTP_SECURE === 'true'
const defaultFromAddress = process.env.SMTP_FROM_EMAIL || siteConfig.contactEmail
const defaultFromName = process.env.SMTP_FROM_NAME || siteConfig.name
const emailConfig = process.env.SMTP_HOST
  ? {
      email: nodemailerAdapter({
        defaultFromAddress,
        defaultFromName,
        transportOptions: {
          auth:
            process.env.SMTP_USER && process.env.SMTP_PASS
              ? {
                  pass: process.env.SMTP_PASS,
                  user: process.env.SMTP_USER,
                }
              : undefined,
          host: process.env.SMTP_HOST,
          port: Number.isFinite(smtpPort) ? smtpPort : 587,
          secure: smtpSecure,
        },
      }),
    }
  : {}

const defaultEditor = lexicalEditor({
  features: [
    ParagraphFeature(),
    UnderlineFeature(),
    BoldFeature(),
    ItalicFeature(),
    LinkFeature({
      enabledCollections: ['posts', 'sections', 'tags'],
      fields: ({ defaultFields }) => {
        const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
          if ('name' in field && field.name === 'url') {
            return false
          }

          return true
        })

        return [
          ...defaultFieldsWithoutUrl,
          {
            name: 'url',
            type: 'text',
            admin: {
              condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
            },
            label: ({ t }) => t('fields:enterURL'),
            required: true,
            validate: ((value, options) => {
              if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
                return true
              }

              return value ? true : 'URL é obrigatória'
            }) as TextFieldSingleValidation,
          },
        ]
      },
    }),
  ],
})

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
  },
  collections: [
    Users,
    Media,
    Authors,
    Accents,
    Sections,
    Tags,
    Posts,
    NewsletterLeads,
    NewsletterMembers,
    ContactMessages,
  ],
  cors: [getSiteURL()].filter(Boolean),
  db: sqliteAdapter({
    client: getDatabaseClientConfig(),
    push: process.env.PAYLOAD_PUSH === 'true' || (process.env.NODE_ENV === 'development' && process.env.PAYLOAD_PUSH !== 'false'),
  }),
  ...emailConfig,
  editor: defaultEditor,
  secret: process.env.PAYLOAD_SECRET || 'troque-esta-chave-em-desenvolvimento',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
