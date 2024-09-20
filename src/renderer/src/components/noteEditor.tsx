import React from 'react'
import MarkdownEditor from './MDxEditor'

interface Note {
  id: string
  title: string
  content: string
}

interface NoteEditorProps {
  note: Note
  onUpdate: (id: string, updates: Partial<Note>) => void
}

export function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const handleContentChange = (content: string) => {
    const title = content.split('\n')[0].replace(/^# /, '') || 'Untitled'
    onUpdate(note.id, { content, title })
  }

  return (
    <div className="w-full h-[100vh]">
      <MarkdownEditor
        key={note.id}
        initialContent={note.content}
        onContentChange={handleContentChange}
      />
    </div>
  )
}