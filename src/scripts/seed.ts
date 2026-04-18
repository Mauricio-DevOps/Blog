import 'dotenv/config'

import type { File } from 'payload'
import path from 'path'
import { getPayload } from 'payload'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'

import configPromise from '@/payload.config'
import { createRichTextDocument } from '@/lib/richText'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const coversDir = path.resolve(dirname, '../seed/covers')

type UpsertCollection = 'accents' | 'authors' | 'media' | 'posts' | 'sections' | 'tags'

type SectionSeed = {
  accent: 'animes' | 'filmes' | 'games' | 'series'
  cover: string
  description: string
  slug: string
  title: string
}

const sections: SectionSeed[] = [
  {
    accent: 'filmes',
    cover: 'filmes.svg',
    description: 'Cronologias, personagens, universos compartilhados e caminhos de entrada para cinema pop.',
    slug: 'filmes',
    title: 'Filmes',
  },
  {
    accent: 'series',
    cover: 'series.svg',
    description: 'Guias para maratonar melhor, entender franquias e não se perder em temporadas longas.',
    slug: 'series',
    title: 'Séries',
  },
  {
    accent: 'animes',
    cover: 'animes.svg',
    description: 'Vocabulário básico, gêneros, ordens de exibição e contexto para começar sem travar.',
    slug: 'animes',
    title: 'Animes',
  },
  {
    accent: 'games',
    cover: 'games.svg',
    description: 'Explicações sobre subgêneros, termos comuns e como escolher bons pontos de entrada.',
    slug: 'games',
    title: 'Games',
  },
]

const tags = [
  {
    description: 'Guias para entender ordem de exibição, arcos e pontos de entrada.',
    name: 'Cronologias',
    slug: 'cronologias',
  },
  {
    description: 'Explicações sobre termos, formatos e jargões recorrentes.',
    name: 'Vocabulário nerd',
    slug: 'vocabulario-nerd',
  },
  {
    description: 'Textos sobre onde assistir, como acompanhar e o que esperar de catálogos.',
    name: 'Streaming',
    slug: 'streaming',
  },
  {
    description: 'Guias de escolha e listas para decidir por onde começar.',
    name: 'Por onde começar',
    slug: 'por-onde-comecar',
  },
  {
    description: 'Curiosidades, contexto e bastidores que ajudam a entender melhor um fenômeno pop.',
    name: 'Contexto',
    slug: 'contexto',
  },
]

const posts = [
  {
    content: createRichTextDocument([
      {
        heading: 'Comece pela lógica do personagem',
        paragraphs: [
          'O jeito menos confuso de assistir aos filmes do Homem-Aranha é separar as fases por intérprete e não pela cronologia interna da Marvel.',
          'Isso reduz a chance de o leitor cair em listas intermináveis quando a dúvida real é entender quem é quem, o que muda entre trilogias e qual ponto de entrada faz mais sentido hoje.',
        ],
      },
      {
        heading: 'A ordem mais amigável para iniciantes',
        paragraphs: [
          'Primeiro, a trilogia do Sam Raimi com Tobey Maguire. Depois, os dois filmes com Andrew Garfield. Em seguida, a fase de Tom Holland ligada ao MCU.',
          'Só depois vale entrar em crossovers como Sem Volta para Casa, porque a graça do filme cresce quando o público reconhece o legado das versões anteriores.',
        ],
      },
      {
        heading: 'Onde muita gente se perde',
        paragraphs: [
          'A dúvida normalmente mistura dois critérios: ordem de lançamento e cronologia interna. Para o iniciante curioso, lançamento costuma funcionar melhor porque acompanha a evolução cultural do personagem.',
          'Se a pessoa quiser aprofundar depois, aí sim vale abrir uma versão mais técnica com cronologia MCU, participações especiais e conexões de streaming.',
        ],
      },
    ]),
    coverSlug: 'cover-filmes',
    excerpt: 'A forma mais simples de entrar na filmografia do herói sem embaralhar versões, estúdios e crossovers cedo demais.',
    featured: true,
    postType: 'explicador',
    publishedAt: '2026-04-10T12:00:00.000Z',
    sectionSlug: 'filmes',
    seoDescription: 'Guia simples para assistir aos filmes do Homem-Aranha na ordem mais amigável para iniciantes.',
    seoTitle: 'A ordem certa para assistir aos filmes do Homem-Aranha',
    slug: 'ordem-certa-para-assistir-aos-filmes-do-homem-aranha',
    status: 'published',
    tagSlugs: ['cronologias', 'por-onde-comecar', 'streaming'],
    title: 'A ordem certa para assistir aos filmes do Homem-Aranha sem se perder',
  },
  {
    content: createRichTextDocument([
      {
        heading: 'A franquia assusta porque parece infinita',
        paragraphs: [
          'Doctor Who existe há décadas, troca elenco, muda showrunners e ainda alterna tons entre ficção científica séria, aventura e humor.',
          'Para um iniciante, a boa notícia é que não é preciso começar pela série clássica para entender a fase moderna.',
        ],
      },
      {
        heading: 'O melhor ponto de entrada hoje',
        paragraphs: [
          'A retomada de 2005 continua sendo o ponto mais didático porque reapresenta o Doutor ao público contemporâneo e explica a lógica básica do universo enquanto a trama anda.',
          'Quem quiser uma porta ainda mais recente pode testar os episódios de entrada de novos Doutores, mas a fase de 2005 ainda entrega o melhor equilíbrio entre acolhimento e impacto.',
        ],
      },
      {
        heading: 'Como orientar o leitor sem complicar',
        paragraphs: [
          'Em vez de despejar décadas de lore, o blog precisa responder duas perguntas: por onde começar e o que pode ser deixado para depois.',
          'Essa lógica editorial vale para várias franquias longas: simplificar primeiro, aprofundar depois.',
        ],
      },
    ]),
    coverSlug: 'cover-series',
    excerpt: 'Um caminho de entrada claro para entender a série sem precisar decorar décadas de lore logo no primeiro contato.',
    featured: false,
    postType: 'explicador',
    publishedAt: '2026-04-08T12:00:00.000Z',
    sectionSlug: 'series',
    seoDescription: 'Guia inicial para começar Doctor Who sem cair no excesso de cronologia e lore.',
    seoTitle: 'Como começar Doctor Who sem se perder',
    slug: 'como-comecar-doctor-who-sem-se-perder',
    status: 'published',
    tagSlugs: ['cronologias', 'por-onde-comecar', 'contexto'],
    title: 'Como começar Doctor Who sem se perder em décadas de episódios',
  },
  {
    content: createRichTextDocument([
      {
        heading: 'Filler não é sinônimo de episódio inútil',
        paragraphs: [
          'No vocabulário de anime, filler costuma ser o material criado para ganhar tempo em relação ao mangá original.',
          'Isso não significa que todo filler seja ruim, mas explica por que tanta gente procura listas para decidir o que ver e o que pode pular.',
        ],
      },
      {
        heading: 'Por que essa dúvida aparece tanto',
        paragraphs: [
          'Quem chega aos animes por indicação de amigos ou por plataformas de streaming quase sempre encontra séries longas primeiro.',
          'Sem contexto, o iniciante fica entre duas frustrações: assistir tudo e se cansar, ou pular demais e perder personagens ou clima.',
        ],
      },
      {
        heading: 'A utilidade editorial está em contextualizar',
        paragraphs: [
          'O blog não precisa tratar filler como regra rígida. O que ajuda é mostrar quando ele atrapalha o ritmo, quando aprofunda elenco e quando simplesmente pode ser deixado para outro momento.',
          'Isso transforma um jargão de nicho em decisão prática de consumo.',
        ],
      },
    ]),
    coverSlug: 'cover-animes',
    excerpt: 'O termo mais repetido em listas de anime explicado em linguagem simples, com foco em decisão prática de maratona.',
    featured: false,
    postType: 'explicador',
    publishedAt: '2026-04-06T12:00:00.000Z',
    sectionSlug: 'animes',
    seoDescription: 'Entenda o que é filler em anime e como isso muda a experiência de maratona.',
    seoTitle: 'O que é filler em anime',
    slug: 'o-que-e-filler-em-anime',
    status: 'published',
    tagSlugs: ['vocabulario-nerd', 'por-onde-comecar', 'contexto'],
    title: 'O que é filler em anime e por que isso muda sua maratona',
  },
  {
    content: createRichTextDocument([
      {
        heading: 'Os nomes parecem iguais, mas não são',
        paragraphs: [
          'Roguelike, roguelite e soulslike viraram atalhos de marketing. O problema é que eles descrevem estruturas de jogo diferentes.',
          'Quando o leitor não entende isso, toda recomendação parece vaga e a descoberta de games fica mais aleatória do que deveria.',
        ],
      },
      {
        heading: 'Como separar os três termos',
        paragraphs: [
          'Roguelike remete à tradição mais rígida, com foco em runs, turnos e punição permanente. Roguelite flexibiliza isso, trazendo progressão parcial e sistemas mais amigáveis.',
          'Soulslike, por outro lado, está mais ligado a combate cadenciado, leitura de padrão, checkpoints e sensação de risco constante.',
        ],
      },
      {
        heading: 'Por que isso importa para o iniciante',
        paragraphs: [
          'Esses termos são filtros de expectativa. Quando a pessoa entende a diferença, escolhe melhor e evita comprar um jogo achando que vai receber outra experiência.',
          'É exatamente esse tipo de contexto que o blog quer entregar.',
        ],
      },
    ]),
    coverSlug: 'cover-games',
    excerpt: 'Três rótulos repetidos o tempo todo no universo gamer explicados de um jeito útil para escolher melhor o que jogar.',
    featured: false,
    postType: 'explicador',
    publishedAt: '2026-04-04T12:00:00.000Z',
    sectionSlug: 'games',
    seoDescription: 'Diferenças entre roguelike, roguelite e soulslike em linguagem acessível.',
    seoTitle: 'Roguelike, roguelite e soulslike: diferenças sem complicação',
    slug: 'roguelike-roguelite-e-soulslike-diferencas-sem-complicacao',
    status: 'published',
    tagSlugs: ['vocabulario-nerd', 'por-onde-comecar', 'contexto'],
    title: 'Roguelike, roguelite e soulslike: diferenças sem complicação',
  },
  {
    content: createRichTextDocument([
      {
        heading: 'Curiosidade pronta para desenvolvimento',
        paragraphs: [
          'Rascunho preparado para virar um texto curto sobre como grandes franquias usam cenas pós-crédito para treinar expectativa do público.',
        ],
      },
    ]),
    coverSlug: 'cover-filmes',
    excerpt: 'Rascunho editorial sobre a função das cenas pós-crédito no cinema pop.',
    featured: false,
    postType: 'curiosidade',
    sectionSlug: 'filmes',
    seoDescription: 'Rascunho sobre cenas pós-crédito no cinema pop.',
    seoTitle: 'Por que cenas pós-crédito viraram ritual',
    slug: 'por-que-cenas-pos-credito-viraram-ritual',
    status: 'draft',
    tagSlugs: ['contexto'],
    title: 'Por que cenas pós-crédito viraram ritual em grandes franquias',
  },
  {
    content: createRichTextDocument([
      {
        heading: 'Novidade pronta para atualização',
        paragraphs: [
          'Estrutura inicial para cobrir renovação, cancelamento ou reentrada de catálogo com contexto para iniciantes e leitores ocasionais.',
        ],
      },
    ]),
    coverSlug: 'cover-series',
    excerpt: 'Rascunho de cobertura para quando uma série ganha nova temporada e o leitor quer saber se vale entrar agora.',
    featured: false,
    postType: 'novidade',
    sectionSlug: 'series',
    seoDescription: 'Rascunho de cobertura editorial para novas temporadas.',
    seoTitle: 'Vale começar uma série quando a nova temporada sai?',
    slug: 'vale-comecar-uma-serie-quando-a-nova-temporada-sai',
    status: 'draft',
    tagSlugs: ['streaming', 'contexto'],
    title: 'Vale começar uma série justamente quando a nova temporada sai?',
  },
  {
    content: createRichTextDocument([
      {
        heading: 'Curiosidade pronta para expansão',
        paragraphs: [
          'Rascunho para discutir por que openings e endings funcionam como porta de entrada emocional para muita gente que começa anime agora.',
        ],
      },
    ]),
    coverSlug: 'cover-animes',
    excerpt: 'Rascunho sobre o papel das openings na experiência de anime.',
    featured: false,
    postType: 'curiosidade',
    sectionSlug: 'animes',
    seoDescription: 'Rascunho sobre openings e endings em anime.',
    seoTitle: 'Por que openings dizem tanto sobre um anime',
    slug: 'por-que-openings-dizem-tanto-sobre-um-anime',
    status: 'draft',
    tagSlugs: ['contexto', 'vocabulario-nerd'],
    title: 'Por que openings dizem tanto sobre um anime antes mesmo do primeiro arco',
  },
  {
    content: createRichTextDocument([
      {
        heading: 'Review preparada para monetização futura',
        paragraphs: [
          'Rascunho pronto para receber recomendações, links afiliados e comparativos quando o blog começar a testar monetização direta nessa editoria.',
        ],
      },
    ]),
    coverSlug: 'cover-games',
    excerpt: 'Rascunho de review com disclosure afiliado já ativado para testar o fluxo do v1.',
    featured: false,
    postType: 'review',
    sectionSlug: 'games',
    seoDescription: 'Rascunho de review para testar monetização futura.',
    seoTitle: 'Como escrever reviews úteis sem virar panfleto',
    slug: 'como-escrever-reviews-uteis-sem-virar-panfleto',
    status: 'draft',
    tagSlugs: ['contexto'],
    title: 'Como escrever reviews úteis sem virar panfleto',
    affiliateDisclosure: true,
  },
]

async function findBySlug(payload: any, collection: UpsertCollection, slug: string) {
  const result = await payload.find({
    collection,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs[0] || null
}

async function upsertBySlug(
  payload: any,
  collection: Exclude<UpsertCollection, 'media'>,
  slug: string,
  data: any,
) {
  const existing = await findBySlug(payload, collection, slug)

  if (existing) {
    return payload.update({
      collection,
      data,
      id: existing.id,
    })
  }

  return payload.create({
    collection,
    data,
  })
}

async function createSvgFile(filenameValue: string): Promise<File> {
  const filePath = path.resolve(coversDir, filenameValue)
  const data = await readFile(filePath)

  return {
    data,
    mimetype: 'image/svg+xml',
    name: filenameValue,
    size: data.byteLength,
  }
}

async function upsertMedia(payload: any, slug: string, alt: string, caption: string, filenameValue: string) {
  const existing = await findBySlug(payload, 'media', slug)

  if (existing) {
    return payload.update({
      collection: 'media',
      data: {
        alt,
        caption,
        slug,
      },
      id: existing.id,
    })
  }

  return payload.create({
    collection: 'media',
    data: {
      alt,
      caption,
      slug,
    },
    file: await createSvgFile(filenameValue),
  })
}

async function main() {
  const payload = await getPayload({
    config: await configPromise,
  })

  console.log('Iniciando seed do blog nerd...')

  const mediaMap = new Map<string, Awaited<ReturnType<typeof upsertMedia>>>()
  const accentMap = new Map<string, Awaited<ReturnType<typeof upsertBySlug>>>()

  const accents = [
    {
      description: 'Tom quente e editorial para cinema, sagas e adaptações.',
      slug: 'filmes',
      tone: '#c04f34',
      title: 'Filmes',
    },
    {
      description: 'Tom azul para maratonas, temporadas e universos seriados.',
      slug: 'series',
      tone: '#245fb6',
      title: 'Séries',
    },
    {
      description: 'Tom âmbar para animações, shonen e entradas de anime.',
      slug: 'animes',
      tone: '#c46f16',
      title: 'Animes',
    },
    {
      description: 'Tom esverdeado para jogos, gêneros e recomendações práticas.',
      slug: 'games',
      tone: '#1f7b56',
      title: 'Games',
    },
  ]

  for (const accent of accents) {
    const accentDoc = await upsertBySlug(payload, 'accents', accent.slug, accent)
    accentMap.set(accent.slug, accentDoc)
  }

  for (const section of sections) {
    const mediaDoc = await upsertMedia(
      payload,
      `cover-${section.slug}`,
      `Capa editorial da seção ${section.title}`,
      `Arte SVG base da seção ${section.title}`,
      section.cover,
    )

    mediaMap.set(`cover-${section.slug}`, mediaDoc)

    await upsertBySlug(payload, 'sections', section.slug, {
      accent: accentMap.get(section.accent)?.id,
      description: section.description,
      slug: section.slug,
      title: section.title,
    })
  }

  const tagMap = new Map<string, Awaited<ReturnType<typeof upsertBySlug>>>()

  for (const tag of tags) {
    const tagDoc = await upsertBySlug(payload, 'tags', tag.slug, tag)
    tagMap.set(tag.slug, tagDoc)
  }

  const author = await upsertBySlug(payload, 'authors', 'equipe-nebulosa', {
    bio: 'Equipe editorial responsável por contextualizar cultura pop em linguagem clara, útil e amigável para iniciantes curiosos.',
    expertise: 'Curadoria e contexto pop',
    name: 'Equipe Nebulosa',
    slug: 'equipe-nebulosa',
  })

  for (const post of posts) {
    const sectionDoc = sections.find((section) => section.slug === post.sectionSlug)
    const coverImage = mediaMap.get(post.coverSlug)

    if (!sectionDoc || !coverImage) {
      continue
    }

    await upsertBySlug(payload, 'posts', post.slug, {
      affiliateDisclosure: Boolean(post.affiliateDisclosure),
      author: author.id,
      content: post.content,
      coverImage: coverImage.id,
      excerpt: post.excerpt,
      featured: post.featured,
      postType: post.postType,
      publishedAt: post.publishedAt,
      section: (await findBySlug(payload, 'sections', sectionDoc.slug))?.id,
      seoDescription: post.seoDescription,
      seoTitle: post.seoTitle,
      slug: post.slug,
      status: post.status,
      tags: post.tagSlugs.map((tagSlug) => tagMap.get(tagSlug)?.id).filter(Boolean),
      title: post.title,
    })
  }

  console.log('Seed concluído com sucesso.')
}

await main()
