import React from 'react'
import { ThemeProvider } from './ThemeProvider'
import { useNotes } from './hooks/useNotes'
import { useTheme } from './hooks/useTheme'
import { Sidebar } from './components/sidebar'
import { NoteEditor } from './components/noteEditor'

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
        <div className="flex-1">
          {activeNote ? (
            <NoteEditor note={activeNote} onNoteUpdate={updateNote} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Select a note or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}
