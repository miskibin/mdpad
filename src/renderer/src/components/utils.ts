import { Descendant, Element, Text } from 'slate'
import { CustomRange } from './types'

export const decorateNode = ([node, path]: [Descendant, number[]]): CustomRange[] => {
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
    const boldRegex = /\*\*((?!\s)[^*]+(?<!\s))\*\*/g
    let match
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
          case 'quote': return `> ${text}\n`
          case 'list-item': return `- ${text}\n`
          case 'list':
            return n.children
              .map((c) => Element.isElement(c) && c.type === 'list-item'
                ? `- ${c.children.map((t) => (Text.isText(t) ? t.text : '')).join('')}\n`
                : '')
              .join('')
          case 'code-block': return `\`\`\`\n${text}\n\`\`\`\n`
          default: return `${text}\n`
        }
      }
      return ''
    })
    .join('')
}