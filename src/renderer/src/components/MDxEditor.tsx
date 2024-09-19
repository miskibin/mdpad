import React, { useMemo, useCallback, useState } from 'react'
import {
  createEditor,
  Descendant,
  Element,
  Transforms,
  Editor,
  Range,
  NodeEntry,
  BaseRange
} from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { CustomEditor, initialValue } from './types'
import { decorateNode, serialize } from './utils'
import { renderElement } from './elements'
import { renderLeaf } from './leafs'
import { EditorCommands } from './editorCommands'

interface MarkdownEditorProps {
  onContentChange?: (content: string) => void
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ onContentChange }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())) as CustomEditor, [])
  const [consecutiveEmptyEnters, setConsecutiveEmptyEnters] = useState(0)

  const handleChange = (value: Descendant[]) => {
    const content = serialize(value)
    if (onContentChange) {
      onContentChange(content)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const { selection } = editor

    if (event.key === 'Enter') {
      event.preventDefault()
      if (selection && Range.isCollapsed(selection)) {
        const [match] = Editor.nodes(editor, {
          match: (n) =>
            Element.isElement(n) && ['list-item', 'quote', 'code-block'].includes(n.type),
          mode: 'lowest'
        })

        if (match) {
          const [node, path] = match
          const range = Editor.range(editor, path)
          const text = Editor.string(editor, range)

          if (text.trim() === '') {
            if (node.type === 'list-item') {
              if (consecutiveEmptyEnters === 1) {
                EditorCommands.exitBlock(editor)
                setConsecutiveEmptyEnters(0)
              } else {
                setConsecutiveEmptyEnters(consecutiveEmptyEnters + 1)
              }
            } else {
              EditorCommands.exitBlock(editor)
            }
          } else {
            if (node.type === 'quote') {
              EditorCommands.insertParagraph(editor)
            } else if (node.type === 'list-item') {
              EditorCommands.toggleBlock(editor, 'list')
            } else {
              Transforms.splitNodes(editor)
            }
            setConsecutiveEmptyEnters(0)
          }
        } else {
          EditorCommands.insertParagraph(editor)
          setConsecutiveEmptyEnters(0)
        }
      }
    } else if (event.key === 'Backspace' && selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: (n) => Element.isElement(n) && n.type === 'list-item',
        mode: 'lowest'
      })

      if (match && Editor.isStart(editor, selection.anchor, match[1])) {
        event.preventDefault()
        EditorCommands.exitBlock(editor)
      }
    } else if (event.key === '>' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const block = Editor.above(editor, {
        match: (n) => Element.isElement(n) && Editor.isBlock(editor, n)
      })
      if (block && Editor.isStart(editor, anchor, block[1])) {
        event.preventDefault()
        EditorCommands.toggleBlock(editor, 'quote')
      }
    } else if (event.key === '-' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection
      const block = Editor.above(editor, {
        match: (n) => Element.isElement(n) && Editor.isBlock(editor, n)
      })
      if (block && Editor.isStart(editor, anchor, block[1])) {
        event.preventDefault()
        EditorCommands.toggleBlock(editor, 'list')
      }
    } else if (event.key === '`' && event.ctrlKey && selection && Range.isCollapsed(selection)) {
      event.preventDefault()
      EditorCommands.toggleBlock(editor, 'code-block')
    }

    setConsecutiveEmptyEnters(0)
  }

  const customDecorate = useCallback((entry: NodeEntry): BaseRange[] => {
    return decorateNode(entry as [Descendant, number[]]) as BaseRange[]
  }, [])

  return (
    <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
      <Editable
        decorate={customDecorate}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={handleKeyDown}
        placeholder="Dear diary..."
        className="w-full p-4 border rounded text-gray-900 dark:text-gray-100 overflow-x-clip outline-none min-h-[100px] focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
      />
    </Slate>
  )
}

export default MarkdownEditor
