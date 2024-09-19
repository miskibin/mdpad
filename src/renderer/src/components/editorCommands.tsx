import { Editor, Element, Transforms, Path } from 'slate'
import { CustomEditor, CustomElement } from './types'

export const EditorCommands = {
  toggleBlock(editor: CustomEditor, format: 'quote' | 'list' | 'code-block') {
    const isActive = this.isBlockActive(editor, format)
    const isList = format === 'list'

    console.log('Toggling block:', format, 'Is active:', isActive) // Debug log

    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && Element.isElement(n) && ['list', 'quote', 'code-block'].includes(n.type),
      split: true,
    })

    if (!isActive) {
      const newProperties: Partial<CustomElement> = { 
        type: isList ? 'list-item' : format 
      }
      Transforms.setNodes<CustomElement>(editor, newProperties)

      if (isList) {
        const block = { type: 'list', children: [] } as CustomElement
        Transforms.wrapNodes(editor, block)
      }
    } else {
      Transforms.setNodes<CustomElement>(editor, { type: 'paragraph' })
    }

    console.log('Editor content after toggle:', editor.children) // Debug log
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
    Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] } as CustomElement)
  },

  insertListItem(editor: CustomEditor) {
    const newListItem = { type: 'list-item', children: [{ text: '' }] } as CustomElement
    Transforms.insertNodes(editor, newListItem)
    
    const [, path] = Editor.above(editor, {
      match: n => Element.isElement(n) && n.type === 'list-item',
    }) || []

    if (path) {
      const parentPath = Path.parent(path)
      const [parentNode] = Editor.node(editor, parentPath)
      if (Element.isElement(parentNode) && parentNode.type !== 'list') {
        Transforms.wrapNodes(editor, { type: 'list', children: [] } as CustomElement, { at: parentPath })
      }
    }

    console.log('Inserted list item. Editor content:', JSON.stringify(editor.children, null, 2))
  },

  exitList(editor: CustomEditor) {
    const { selection } = editor
    if (!selection) return

    const [listItem] = Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'list-item',
      mode: 'lowest',
    })

    if (listItem) {
      const [, listItemPath] = listItem
      const listPath = Path.parent(listItemPath)
      const [list] = Editor.node(editor, listPath)

      // Convert the current list item to a paragraph
      Transforms.setNodes(editor, { type: 'paragraph' } as Partial<CustomElement>, { at: listItemPath })

      // If this was the last item in the list, remove the list
      if (Element.isElement(list) && list.children.length === 1) {
        Transforms.removeNodes(editor, { at: listPath })
      } else {
        // Otherwise, lift the paragraph out of the list
        Transforms.liftNodes(editor, { at: listItemPath })
      }

      console.log('Exited list. Editor content:', JSON.stringify(editor.children, null, 2))
    }
  },

  exitBlock(editor: CustomEditor) {
    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && Element.isElement(n) && ['list', 'quote', 'code-block'].includes(n.type),
      split: true,
    })
    Transforms.setNodes<CustomElement>(editor, { type: 'paragraph' })

    console.log('Exited block. Editor content:', editor.children) // Debug log
  },
}