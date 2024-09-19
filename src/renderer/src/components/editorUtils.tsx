import { BaseEditor, Descendant, Element, Text, Editor } from 'slate'
import { ReactEditor } from 'slate-react'

export type CustomElement = {
  type: 'paragraph' | 'quote' | 'list-item' | 'list'
  children: CustomText[]
}
export type CustomText = { text: string; bold?: boolean; italic?: boolean; code?: boolean }
export type CustomEditor = BaseEditor & ReactEditor

export interface CustomRange {
  anchor: { path: number[]; offset: number }
  focus: { path: number[]; offset: number }
  heading?: boolean
  level?: number
  bold?: boolean
  italic?: boolean
  code?: boolean
}

export const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Start typing here...' }]
  }
]

export const decorateNode = ([node, path]: [any, number[]]): CustomRange[] => {
  const ranges: CustomRange[] = []

  if (Text.isText(node)) {
    const { text } = node

    // Heading
    const headingMatch = text.match(/^(#{1,6})\s/)
    if (headingMatch && path[path.length - 1] === 0) {
      ranges.push({
        anchor: { path, offset: 0 },
        focus: { path, offset: text.length },
        heading: true,
        level: headingMatch[1].length
      })
    }

    // Bold
    let match
    const boldRegex = /\*\*((?!\s)[^*]+(?<!\s))\*\*/g
    while ((match = boldRegex.exec(text)) !== null) {
      ranges.push({
        anchor: { path, offset: match.index },
        focus: { path, offset: match.index + match[0].length },
        bold: true
      })
    }

    // Italic
    const italicRegex = /\*((?!\s)[^*]+(?<!\s))\*/g
    while ((match = italicRegex.exec(text)) !== null) {
      ranges.push({
        anchor: { path, offset: match.index },
        focus: { path, offset: match.index + match[0].length },
        italic: true
      })
    }

    // Inline code
    const codeRegex = /`([^`\n]+)`/g
    while ((match = codeRegex.exec(text)) !== null) {
      ranges.push({
        anchor: { path, offset: match.index },
        focus: { path, offset: match.index + match[0].length },
        code: true
      })
    }
  }

  return ranges
}

export const serialize = (nodes: Descendant[]): string => {
  return nodes
    .map((n) => {
      if (Element.isElement(n)) {
        const text = n.children.map((c) => (Text.isText(c) ? c.text : '')).join('')
        switch (n.type) {
          case 'quote':
            return `> ${text}\n`
          case 'list-item':
            return `- ${text}\n`
          case 'list':
            return n.children
              .map((c) =>
                Element.isElement(c) && c.type === 'list-item'
                  ? `- ${c.children.map((t) => (Text.isText(t) ? t.text : '')).join('')}\n`
                  : ''
              )
              .join('')
          default:
            return `${text}\n`
        }
      }
      return ''
    })
    .join('')
}
