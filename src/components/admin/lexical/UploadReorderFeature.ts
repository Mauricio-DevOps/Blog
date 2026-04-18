import { createServerFeature } from '@payloadcms/richtext-lexical'

export const UploadReorderFeature = createServerFeature({
  dependencies: ['upload'],
  feature: {
    ClientFeature:
      '@/components/admin/lexical/UploadReorderFeature.client#UploadReorderFeatureClient',
  },
  key: 'uploadReorder',
})
