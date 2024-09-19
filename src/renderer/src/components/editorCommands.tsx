import { Editor, Element, Transforms, Range } from 'slate'
import { CustomEditor, ParagraphElement, QuoteElement, ListItemElement, ListElement, CodeBlockElement } from './types'

export const EditorCommands = {
  toggleBlock(editor: CustomEditor, format: string) {
    const isActive = this.isBlockActive(editor, format)
    const isList = format === 'list'

    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && Element.isElement(n) && ['list', 'quote', 'code-block'].includes(n.type),
      split: true,
    })

    if (!isActive) {
      const newProperties: Partial<Element> = { type: isList ? 'list-item' : format }
      Transforms.setNodes<Element>(editor, newProperties)

      if (isList) {
        const block = { type: 'list', children: [] }
        Transforms.wrapNodes(editor, block)
      }
    } else {
      Transforms.setNodes(editor, { type: 'paragraph' })
    }
  },

  isBlockActive(editor: CustomEditor, format: string) {
    const { selection } = editor
    if (!selection) return false

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === format,
      })
    )

    return !!match
  },

  insertParagraph(editor: CustomEditor) {
    Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] } as ParagraphElement)
  },

  exitBlock(editor: CustomEditor) {
    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && Element.isElement(n) && ['list', 'quote', 'code-block'].includes(n.type),
      split: true,
    })
    Transforms.setNodes(editor, { type: 'paragraph' })
  },
}