# Rascunhos automatizados

Este projeto esta preparado para uma automacao futura do Codex gerar posts e importar tudo como `draft` no Payload. A automacao ainda nao deve publicar direto.

## Variaveis locais

Copie `.env.example` para `.env` e preencha os valores reais apenas no `.env`.

Para teste local:

```powershell
$env:DATABASE_URL = "file:./blog-nerd.db"
$env:TURSO_AUTH_TOKEN = ""
$env:AUTO_DRAFT_ALLOW_PRODUCTION = "false"
```

Para importar no Turso de producao, use os segredos reais e libere a trava explicitamente:

```powershell
$env:DATABASE_URL = "libsql://..."
$env:TURSO_AUTH_TOKEN = "..."
$env:AUTO_DRAFT_ALLOW_PRODUCTION = "true"
```

## Dry-run

Valide o JSON, as relacoes do Payload e o slug que seria usado:

```powershell
npm run draft:import -- --input src/fixtures/auto-draft.example.json --dry-run
```

O dry-run nao baixa imagens e nao cria documentos.

## Importacao real

Rode contra o banco desejado:

```powershell
npm run draft:import -- --input src/fixtures/auto-draft.example.json
```

O importador sempre cria o post como:

- `status: draft`
- `featured: false`
- `publishedAt: null`
- autor `equipe-nebulosa`

Se o titulo gerar um slug ja existente, o script tenta `slug-YYYY-MM-DD`. Se esse slug tambem existir, ele falha sem sobrescrever nada.

## Contrato do JSON

Campos principais:

- `topic`, `title`, `excerpt`, `sectionSlug`, `postType`, `tagSlugs`, `seoTitle`, `seoDescription`
- `coverAssetKey`
- `assets[]` com `key`, `downloadUrl`, `sourceUrl`, `alt`, `caption`, `credit`, `license`
- `blocks[]` com `heading`, `paragraph` ou `image`
- `sources[]` com links consultados

Regras de imagem:

- `downloadUrl` e `sourceUrl` precisam ser HTTPS.
- toda imagem precisa ter fonte, credito e licenca.
- Google Images, Pinterest e redes sociais sao bloqueados como origem de imagem.
- a capa e obrigatoria.
- o corpo aceita no maximo 2 imagens internas.
- a API da OpenAI nao e usada nesta versao.

## Prompt-base para a futura automacao

Use este prompt como base quando criar a automacao no Codex:

```text
Todos os dias as 9h, pesquise temas em alta sobre filmes, series, animes ou games. Escolha um tema aderente ao blog Nebulosa, gere um JSON AutoDraftPostInput valido em PT-BR, use apenas imagens licenciadas com HTTPS, credito e licenca claros, e rode:

npm run draft:import -- --input <arquivo-gerado.json>

Nunca publique direto. O post precisa entrar como draft para revisao manual no admin do Payload.
```

## Checklist antes de publicar no admin

- conferir titulo, slug, resumo e SEO;
- abrir as fontes e confirmar que sustentam o texto;
- validar credito/licenca das imagens;
- revisar legenda e alt text;
- conferir se a capa e as imagens internas carregam;
- ajustar `draft` para `published` somente depois da revisao.

## Checklist de rotacao de segredos

Como segredos reais ja apareceram no `.env.example`, rotacione antes de ativar automacoes:

- Turso: revogar o token antigo e criar novo token de escrita.
- GitHub Actions: atualizar `DATABASE_URL`, `TURSO_AUTH_TOKEN`, `PAYLOAD_SECRET`, `AUTH_SECRET` e demais secrets usados no workflow.
- Azure App Service: atualizar as application settings correspondentes.
- Payload: gerar novo `PAYLOAD_SECRET` forte e aplicar no ambiente.
- Auth.js/NextAuth: gerar novo `AUTH_SECRET` forte e aplicar no ambiente.
- Maquina local: atualizar somente o `.env`, nunca `.env.example`.
