import React from 'react'
import { ThemeProvider } from './ThemeProvider'
import { useTheme } from './hooks/useTheme'
import { Sidebar } from './components/sidebar'
import { NoteEditor } from './components/noteEditor'
import { useNotes } from './hooks/useNotes'
import { FileText } from 'lucide-react'

export default function App() {
  const { notes, activeNoteId, setActiveNoteId, createNote, updateNote, deleteNote } = useNotes()
  const { theme, toggleTheme } = useTheme()

  const activeNote = notes.find((note) => note.id === activeNoteId)

  return (
    <ThemeProvider theme={theme}>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onNoteSelect={setActiveNoteId}
          onNoteCreate={createNote}
          onNoteDelete={deleteNote}
          onThemeToggle={toggleTheme}
        />
        {activeNote ? (
          <NoteEditor note={activeNote} onUpdate={updateNote} />
        ) : (
            <div className="flex items-center justify-center h-full w-full bg-background text-foreground">
              <div className="text-center">
                <FileText className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
                <h2 className="text-2xl font-semibold mb-2">No Note Selected</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Select an existing note from the sidebar or create a new one to get started.
                </p>
              </div>
            </div>
        )}
      </div>
    </ThemeProvider>
  )
}
