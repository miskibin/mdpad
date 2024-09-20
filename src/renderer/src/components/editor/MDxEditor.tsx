import React, { useMemo, useCallback, useState, useEffect } from 'react'
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
import { CustomEditor } from './types'
import { decorateNode, serialize, deserialize } from './utils'
import { renderElement, renderLeaf } from './elements'
import { EditorCommands } from './editorCommands'

interface MarkdownEditorProps {
  initialContent?: string
  onContentChange?: (content: string) => void
}

const defaultInitialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
]

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ initialContent, onContentChange }) => {
  const editor = useMemo(
    () => withErrorBoundary(withHistory(withReact(createEditor()))) as CustomEditor,
    []
  )
  const [consecutiveEmptyEnters, setConsecutiveEmptyEnters] = useState(0)

  const [editorValue, setEditorValue] = useState<Descendant[]>(() => 
    deserialize(initialContent) || defaultInitialValue
  )

  useEffect(() => {
    setEditorValue(deserialize(initialContent) || defaultInitialValue)
  }, [initialContent])

  const handleChange = useCallback(
    (value: Descendant[]) => {
      setEditorValue(value)
      const content = serialize(value)
      if (onContentChange) {
        onContentChange(content)
      }
    },
    [onContentChange]
  )
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      try {
        const { selection } = editor

        if (event.key === 'Enter') {
          event.preventDefault()
          if (selection && Range.isCollapsed(selection)) {
            const [match] = Editor.nodes(editor, {
              match: (n) =>
                !Editor.isEditor(n) &&
                Element.isElement(n) &&
                ['list-item', 'quote', 'code-block'].includes(n.type),
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
                      setConsecutiveEmptyEnters(1)
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
            match: (n) => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'list-item',
            mode: 'lowest'
          })

          if (match && Editor.isStart(editor, selection.anchor, match[1])) {
            event.preventDefault()
            EditorCommands.exitList(editor)
          }
        } else if (event.key === '>' && selection && Range.isCollapsed(selection)) {
          const { anchor } = selection
          const block = Editor.above(editor, {
            match: (n) => !Editor.isEditor(n) && Element.isElement(n) && Editor.isBlock(editor, n)
          })
          if (block && Editor.isStart(editor, anchor, block[1])) {
            event.preventDefault()
            EditorCommands.toggleBlock(editor, 'quote')
          }
        } else if (event.key === '-' && selection && Range.isCollapsed(selection)) {
          const { anchor } = selection
          const block = Editor.above(editor, {
            match: (n) => !Editor.isEditor(n) && Element.isElement(n) && Editor.isBlock(editor, n)
          })
          if (block && Editor.isStart(editor, anchor, block[1])) {
            event.preventDefault()
            EditorCommands.toggleBlock(editor, 'list')
          }
        } else if (
          event.key === '`' &&
          event.ctrlKey &&
          selection &&
          Range.isCollapsed(selection)
        ) {
          event.preventDefault()
          EditorCommands.toggleBlock(editor, 'code-block')
        } else {
          setConsecutiveEmptyEnters(0) // Reset the counter for any other key press
        }
      } catch (error) {
        console.error('Error in handleKeyDown:', error)
        // Optionally, reset the editor state or take other recovery actions
      }
    },
    [editor, consecutiveEmptyEnters]
  )

  const customDecorate = useCallback((entry: NodeEntry): BaseRange[] => {
    try {
      return decorateNode(entry as [Descendant, number[]]) as BaseRange[]
    } catch (error) {
      console.error('Error in customDecorate:', error)
      return []
    }
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      <Slate editor={editor} initialValue={editorValue} onChange={handleChange}>
        <div className="flex-grow overflow-auto">
          <Editable
            decorate={customDecorate}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={handleKeyDown}
            className="w-full h-full p-4 text-foreground outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          />
        </div>
      </Slate>
    </div>
  )
}

// Custom plugin to add error boundary to editor operations
const withErrorBoundary = (editor: Editor) => {
  const { apply } = editor

  editor.apply = (operation) => {
    try {
      apply(operation)
    } catch (error) {
      console.error('Error applying operation:', error, operation)
      // Optionally, you could try to recover here, e.g., by resetting the editor state
    }
  }

  return editor
}

export default MarkdownEditor