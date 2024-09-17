import { useState, useCallback, useEffect } from 'react'

export type Note = {
  id: string
  title: string
  content: string
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('notes')
    return savedNotes
      ? JSON.parse(savedNotes)
      : [{ id: '1', title: 'Welcome', content: '# Welcome\nThis is your first note!' }]
  })
  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => notes[0]?.id || null)

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled',
      content: '# Untitled'
    }
    setNotes((prevNotes) => [...prevNotes, newNote])
    console.log(newNote.id)
    console.log(notes)
    setActiveNoteId(newNote.id)
  }, [])

  const updateNote = useCallback((updatedNote: Note) => {
    console.log(updatedNote.id, 'updateNote')
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    )
  }, [])

  const deleteNote = useCallback(
    (noteId: string) => {
      setNotes((prevNotes) => {
        const updatedNotes = prevNotes.filter((note) => note.id !== noteId)
        if (updatedNotes.length === 0) {
          const newNote: Note = {
            id: Date.now().toString(),
            title: 'Untitled',
            content: '# Untitled'
          }
          return [newNote]
        }
        return updatedNotes
      })

      setActiveNoteId((prevActiveNoteId) => {
        if (prevActiveNoteId === noteId) {
          const updatedNotes = notes.filter((note) => note.id !== noteId)
          return updatedNotes.length > 0 ? updatedNotes[0].id : null
        }
        return prevActiveNoteId
      })
    },
    [notes]
  )

  return {
    notes,
    activeNoteId,
    setActiveNoteId,
    createNote,
    updateNote,
    deleteNote
  }
}
