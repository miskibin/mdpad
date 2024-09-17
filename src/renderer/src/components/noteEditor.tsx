import React from 'react'
import {
  MDXEditor,
  codeBlockPlugin,
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  thematicBreakPlugin,
  frontmatterPlugin,
  tablePlugin,
  toolbarPlugin,
  AdmonitionDirectiveDescriptor,
  directivesPlugin,
  InsertImage,
  InsertThematicBreak,
  InsertCodeBlock,
  DirectiveDescriptor,
  GenericDirectiveEditor
} from '@mdxeditor/editor'
import { useNoteEditor } from '@renderer/hooks/useNoteEditor'

type Note = {
  id: string
  title: string
  content: string
}

type NoteEditorProps = {
  note: Note
  onNoteUpdate: (updatedNote: Note) => void
}

async function imageUploadHandler(file: File): Promise<string> {
  console.log(file)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      if (event.target?.result) {
        try {
          const filePath = await window.electron.ipcRenderer.invoke('save-image', {
            name: file.name,
            data: event.target.result
          })
          resolve(filePath)
        } catch (error) {
          reject(error)
        }
      }
    }
    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}

export function NoteEditor({ note, onNoteUpdate }: NoteEditorProps) {
  const { editorRef, handleContentChange } = useNoteEditor(note, onNoteUpdate)

  return (
    <div className="flex-grow overflow-auto">
      <MDXEditor
        ref={editorRef}
        className="h-full prose prose-slate dark:prose-code:text-red-400 prose-code:text-red-700 dark:prose-invert max-w-none "
        markdown={note.content}
        key={note.id}
        onChange={handleContentChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({ imageUploadHandler }),
          frontmatterPlugin(),
          tablePlugin(),
          directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <InsertImage />
                <InsertThematicBreak />
                {/* Add other toolbar items as needed */}
              </>
            )
          })
        ]}
        contentEditableClassName="outline-none px-4 py-2"
      />
    </div>
  )
}
