import React, { useMemo, useCallback, useState } from 'react'
import {
  createEditor,
  Descendant,
  Element,
  Transforms,
  Editor,
  Range,
  NodeEntry,
  BaseRange,
  Node
} from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { CustomEditor, initialValue } from './types'
import { decorateNode, serialize } from './utils'
import { renderElement } from './elements'
import { renderLeaf } from './leafs'
import { EditorCommands } from './editorcommands'

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
    console.log('Editor content:', JSON.stringify(value, null, 2))
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

        console.log('Enter pressed. Current node:', JSON.stringify(match, null, 2))
        console.log('Consecutive empty enters:', consecutiveEmptyEnters)

        if (match) {
          const [node, path] = match
          if (Element.isElement(node)) {
            const range = Editor.range(editor, path)
            const text = Editor.string(editor, range)

            console.log('Node type:', node.type, 'Text:', text)

            if (text.trim() === '') {
              if (node.type === 'list-item') {
                if (consecutiveEmptyEnters === 1) {
                  console.log('Exiting list')
                  EditorCommands.exitList(editor)
                  setConsecutiveEmptyEnters(0)
                } else {
                  console.log('Inserting empty list item')
                  EditorCommands.insertListItem(editor)
                  setConsecutiveEmptyEnters(consecutiveEmptyEnters + 1)
                }
              } else {
                EditorCommands.exitBlock(editor)
                setConsecutiveEmptyEnters(0)
              }
            } else {
              if (node.type === 'quote') {
                EditorCommands.insertParagraph(editor)
              } else if (node.type === 'list-item') {
                EditorCommands.insertListItem(editor)
              } else {
                Transforms.splitNodes(editor)
              }
              setConsecutiveEmptyEnters(0)
            }
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
        EditorCommands.exitList(editor)
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
    } else {
      setConsecutiveEmptyEnters(0) // Reset the counter for any other key press
    }
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
