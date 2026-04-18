type LexicalTextNode = {
  detail: number
  format: number
  mode: 'normal'
  style: string
  text: string
  type: 'text'
  version: 1
}

type LexicalBlockNode = {
  children: LexicalTextNode[]
  direction: 'ltr'
  format: string
  indent: number
  type: 'heading' | 'paragraph'
  version: 1
  tag?: 'h2' | 'h3' | 'h4'
}

function createTextNode(text: string): LexicalTextNode {
  return {
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
    type: 'text',
    version: 1,
  }
}

function createParagraphNode(text: string): LexicalBlockNode {
  return {
    children: [createTextNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
  }
}

function createHeadingNode(text: string, tag: 'h2' | 'h3' | 'h4' = 'h2'): LexicalBlockNode {
  return {
    children: [createTextNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    tag,
    type: 'heading',
    version: 1,
  }
}

export function createRichTextDocument(
  sections: Array<{
    heading?: string
    paragraphs: string[]
  }>,
) {
  const children = sections.flatMap((section) => {
    const blocks: LexicalBlockNode[] = []

    if (section.heading) {
      blocks.push(createHeadingNode(section.heading))
    }

    section.paragraphs.forEach((paragraph) => {
      blocks.push(createParagraphNode(paragraph))
    })

    return blocks
  })

  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}
