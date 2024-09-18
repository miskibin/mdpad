import React, { useMemo, useCallback } from 'react'
import { createEditor, Descendant, BaseEditor, BaseRange, Text, Element, Transforms } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'

type CustomElement = { type: 'paragraph' | 'code-block'; children: CustomText[] }
type CustomText = { text: string; bold?: boolean; italic?: boolean; code?: boolean }
type CustomEditor = BaseEditor & ReactEditor

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}

interface CustomRange extends BaseRange {
  heading?: boolean
  level?: number
  bold?: boolean
  italic?: boolean
  code?: boolean
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Start typing here...' }]
  }
]

interface MarkdownEditorProps {
  onContentChange?: (content: string) => void
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ onContentChange }) => {
  const editor = useMemo(() => withReact(createEditor()), [])

  const decorateNode = useCallback(([node, path]: [any, number[]]) => {
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
  }, [])

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'code-block':
        return (
          <pre
            {...props.attributes}
            className="bg-gray-100 dark:bg-gray-800 rounded p-2 my-2 overflow-x-auto"
          >
            <code>{props.children}</code>
          </pre>
        )
      default:
        return <p {...props.attributes}>{props.children}</p>
    }
  }, [])

  const renderLeaf = useCallback(({ attributes, children, leaf }: any) => {
    let classes = ''

    if (leaf.heading) {
      classes += [
        'font-bold inline-block mt-2 mb-1',
        leaf.level === 1 ? 'text-3xl' : '',
        leaf.level === 2 ? 'text-2xl' : '',
        leaf.level === 3 ? 'text-xl' : '',
        leaf.level === 4 ? 'text-lg' : '',
        leaf.level === 5 ? 'text-base' : '',
        leaf.level === 6 ? 'text-sm' : ''
      ].join(' ')
    }

    if (leaf.bold) {
      classes += ' font-bold'
    }

    if (leaf.italic) {
      classes += ' italic'
    }

    if (leaf.code) {
      classes += ' font-mono bg-gray-200 dark:bg-gray-700 rounded px-1'
    }

    return (
      <span {...attributes} className={classes}>
        {children}
      </span>
    )
  }, [])

  const serialize = (nodes: Descendant[]): string => {
    return nodes
      .map((n) => {
        if (Element.isElement(n) && n.type === 'code-block') {
          return '```\n' + n.children.map((c) => (Text.isText(c) ? c.text : '')).join('') + '\n```'
        }
        return Element.isElement(n) ? n.children.map((c) => (Text.isText(c) ? c.text : '')).join('') : ''
      })
      .join('\n')
  }

  const handleChange = (value: Descendant[]) => {
    const content = serialize(value)
    if (onContentChange) {
      onContentChange(content)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      const [start] = editor.range ? [editor.range.anchor] : [null]
      if (start) {
        const blockEntry = editor.above({
          match: n => Element.isElement(n) && Editor.isBlock(editor, n)
        })
        if (blockEntry) {
          const [block, path] = blockEntry
          const start = Editor.start(editor, path)
          const range = { anchor: start, focus: editor.selection ? editor.selection.focus : start }
          const text = Editor.string(editor, range)
          const codeMatch = text.match(/^```\s*$/)
          
          if (codeMatch) {
            event.preventDefault()
            Transforms.setNodes(
              editor,
              { type: 'code-block' },
              { match: n => Element.isElement(n) && Editor.isBlock(editor, n) }
            )
            Transforms.delete(editor, { at: range })
            return
          }
        }
      }
    }
  }

  return (
    <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
      <Editable
        decorate={decorateNode}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={handleKeyDown}
        placeholder="Type your markdown here. Use # for headings, ** for bold, * for italic, ` for inline code, and ``` for code blocks."
        className="w-full p-4 border rounded text-gray-900 dark:text-gray-100 overflow-auto outline-none min-h-[100px] focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
      />
    </Slate>
  )
}

export default MarkdownEditor