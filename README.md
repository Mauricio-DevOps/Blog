# Nebulosa Pop

MVP local-first de um blog nerd em PT-BR construído com `Next.js + Payload CMS + SQLite`.

O projeto nasce com:

- home híbrida editorial
- quatro editorias iniciais: `Filmes`, `Séries`, `Animes` e `Games`
- painel admin do Payload em `/admin`
- posts públicos em `/post/[slug]`
- páginas de tag em `/tag/[slug]`
- newsletter local gravada no CMS
- sitemap e `robots.txt`
- seed com 4 posts publicados e 4 rascunhos

## Stack

- `Next.js 16`
- `Payload CMS 3.83`
- `SQLite` via `@payloadcms/db-sqlite`
- `Lexical` para rich text

## Rodando localmente

1. Instale dependências:

```bash
npm install
```

2. Garanta o arquivo `.env`:

```bash
copy .env.example .env
```

3. Gere tipos e import map do Payload:

```bash
npm run setup
```

4. Carregue o conteúdo inicial:

```bash
npm run seed
```

5. Suba o ambiente local:

```bash
npm run dev
```

6. Acesse:

- site: [http://localhost:3000](http://localhost:3000)
- admin: [http://localhost:3000/admin](http://localhost:3000/admin)

Na primeira entrada do admin, o Payload permite criar o usuário inicial.

## Scripts principais

```bash
npm run dev
npm run build
npm run lint
npm run setup
npm run seed
```

## Estrutura editorial

- `sections`: editorias principais do blog
- `tags`: agrupamentos transversais
- `authors`: autores editoriais
- `posts`: conteúdo público com SEO, capa, tipo e status
- `newsletter-leads`: captação de e-mail
- `media`: uploads locais usados como capa e apoio visual

## Seed

O seed cria:

- 4 seções
- 5 tags
- 1 autor base
- 4 capas SVG
- 4 posts evergreen publicados
- 4 rascunhos preparados para curiosidades, novidades e review

O banco SQLite local fica em `blog-nerd.db`.

## Verificação já executada

Os seguintes checks já foram rodados nesta base:

- `npm run setup`
- `npm run seed`
- `npm run lint`
- `npm run build`

Também houve validação HTTP local com resposta `200` em:

- `/`
- `/filmes`
- `/post/ordem-certa-para-assistir-aos-filmes-do-homem-aranha`
- `/admin`
