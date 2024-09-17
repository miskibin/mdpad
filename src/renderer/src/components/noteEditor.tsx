import React from 'react'
import {
  MDXEditor,
  codeBlockPlugin,
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  imagePlugin,
  thematicBreakPlugin
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

export function NoteEditor({ note, onNoteUpdate }: NoteEditorProps) {
  const { editorRef, handleContentChange } = useNoteEditor(note, onNoteUpdate)

  return (
    <div className="flex-grow overflow-auto">
      <MDXEditor
        ref={editorRef}
        className="h-full prose prose-slate dark:prose-code:text-red-400 prose-code:text-red-700 dark:prose-invert max-w-none prose-sm"
        markdown={note.content}
        onChange={handleContentChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          codeBlockPlugin(),
          imagePlugin()
        ]}
        contentEditableClassName="outline-none px-4 py-2"
      />
    </div>
  )
}
