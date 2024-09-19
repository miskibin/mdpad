import React, { useMemo, useCallback, useState } from 'react'
import { createEditor, Descendant, Element, Transforms, Editor, Range } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { CustomElement, CustomEditor, initialValue, decorateNode, serialize } from './editorUtils'

interface MarkdownEditorProps {
  onContentChange?: (content: string) => void
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ onContentChange }) => {
  const editor = useMemo(() => withReact(createEditor() as CustomEditor), [])
  const [consecutiveEnters, setConsecutiveEnters] = useState(0)

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'quote':
        return (
          <blockquote {...props.attributes} className="border-l-4 border-gray-300 pl-4 my-2 italic">
            {props.children}
          </blockquote>
        )
      case 'list-item':
        return <li {...props.attributes}>{props.children}</li>
      case 'list':
        return (
          <ul {...props.attributes} className="list-disc ml-6">
            {props.children}
          </ul>
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

  const handleChange = (value: Descendant[]) => {
    const content = serialize(value)
    if (onContentChange) {
      onContentChange(content)
    }
  }
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const { selection } = editor

    if (event.key === 'Enter') {
      if (selection && Range.isCollapsed(selection)) {
        const [match] = Editor.nodes(editor, {
          match: (n): n is CustomElement =>
            Element.isElement(n) && (n.type === 'list-item' || n.type === 'quote')
        })

        if (match) {
          const [node, path] = match
          const start = Editor.start(editor, path)
          const range = { anchor: start, focus: selection.focus }
          const text = Editor.string(editor, range)

          if (text.trim() === '') {
            event.preventDefault()
            if (node.type === 'list-item') {
              if (consecutiveEnters === 1) {
                const [parentList] = Editor.parent(editor, path)
                if (Element.isElement(parentList) && parentList.type === 'list') {
                  const [grandParent, grandParentPath] = Editor.parent(editor, path.slice(0, -1))
                  if (Element.isElement(grandParent) && grandParent.type === 'list-item') {
                    // We're in a nested list, move up one level
                    Transforms.moveNodes(editor, {
                      at: path,
                      to: Path.next(grandParentPath)
                    })
                  } else {
                    // We're in a top-level list, exit the list
                    Transforms.unwrapNodes(editor, {
                      match: (n): n is ListElement => Element.isElement(n) && n.type === 'list',
                      split: true
                    })
                    Transforms.setNodes<CustomElement>(editor, { type: 'paragraph' })
                  }
                }
                setConsecutiveEnters(0)
              } else {
                Transforms.insertNodes(editor, {
                  type: 'list-item',
                  children: [{ text: '' }]
                } as ListItemElement)
                setConsecutiveEnters(consecutiveEnters + 1)
              }
            } else if (node.type === 'quote') {
              Transforms.unwrapNodes(editor, {
                match: (n): n is CustomElement => Element.isElement(n) && n.type === 'quote',
                split: true
              })
              Transforms.setNodes<CustomElement>(editor, { type: 'paragraph' })
            }
          } else {
            if (node.type === 'list-item') {
              event.preventDefault()
              Transforms.splitNodes(editor, { always: true })
              setConsecutiveEnters(0)
            }
            // For quotes, we'll let the default behavior happen
          }
        } else {
          // For regular paragraphs, we'll let the default behavior happen
          setConsecutiveEnters(0)
        }
      }
    } else {
      setConsecutiveEnters(0)
    }

    if (event.key === '>' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const block = Editor.above(editor, {
        match: (n) => Element.isElement(n) && Editor.isBlock(editor, n)
      })
      const path = block ? block[1] : []
      const start = Editor.start(editor, path)
      const range = { anchor: start, focus: anchor }
      const beforeText = Editor.string(editor, range)

      if (beforeText === '') {
        event.preventDefault()
        Transforms.setNodes<CustomElement>(editor, { type: 'quote' })
      }
    }

    if (event.key === '-' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const block = Editor.above(editor, {
        match: (n) => Element.isElement(n) && Editor.isBlock(editor, n)
      })
      const path = block ? block[1] : []
      const start = Editor.start(editor, path)
      const range = { anchor: start, focus: anchor }
      const beforeText = Editor.string(editor, range)

      if (beforeText === '') {
        event.preventDefault()
        const list: ListElement = { type: 'list', children: [] }
        const listItem: ListItemElement = { type: 'list-item', children: [{ text: '' }] }
        Transforms.wrapNodes(editor, list)
        Transforms.wrapNodes(editor, listItem)
        Transforms.move(editor)
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
        placeholder="Type your markdown here. Use # for headings, ** for bold, * for italic, ` for inline code, > for quotes, and - for list items."
        className="w-full p-4 border rounded text-gray-900 dark:text-gray-100 overflow-auto outline-none min-h-[100px] focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
      />
    </Slate>
  )
}

export default MarkdownEditor
