import { useCallback, useRef, useEffect } from 'react'
import { MDXEditorMethods } from '@mdxeditor/editor'
import { debounce } from 'lodash'

type Note = {
  id: string
  title: string
  content: string
}

export const useNoteEditor = (note: Note, onNoteUpdate: (updatedNote: Note) => void) => {
  const editorRef = useRef<MDXEditorMethods>(null)

  const handleContentChange = useCallback(
    debounce((content: string) => {
      const newTitle = content.split('\n')[0].replace(/^#\s/, '').trim()
      onNoteUpdate({ ...note, title: newTitle, content })
    }, 300),
    [note, onNoteUpdate]
  )

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setMarkdown(note.content)
    }
  }, [note.id, note.content])

  return {
    editorRef,
    handleContentChange
  }
}
