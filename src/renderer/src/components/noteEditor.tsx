import MarkdownRenderer from './MDxEditor'

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

  return (
    <div className="flex-grow overflow-auto">
      <MarkdownRenderer initialContent="# Hello\nThis is some **bold** and *italic* text." />
    </div>
  )
}
