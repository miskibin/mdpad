import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface Note {
  id: string
  title: string
  content: string
}

declare global {
  interface Window {
    context: {
      getNotes: () => Promise<Note[]>
      readNote: (id: string) => Promise<Note>
      writeNote: (note: Note) => Promise<void>
      createNote: (note: Omit<Note, 'id'>) => Promise<string>
      deleteNote: (id: string) => Promise<void>
    }
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      const loadedNotes = await window.context.getNotes()
      setNotes(loadedNotes)
    } catch (error) {
      console.error('Error loading notes:', error)
    }
  }

  const createNote = async () => {
    const newNote = {
      title: 'New Note',
      content: '# New Note\n\nStart typing here...'
    }
    try {
      const id = await window.context.createNote(newNote)
      setNotes([...notes, { ...newNote, id }])
      setActiveNoteId(id)
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const updatedNote = { ...notes.find(note => note.id === id), ...updates } as Note
      await window.context.writeNote(updatedNote)
      setNotes(notes.map(note => note.id === id ? updatedNote : note))
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const deleteNote = async (id: string) => {
    try {
      await window.context.deleteNote(id)
      setNotes(notes.filter(note => note.id !== id))
      if (activeNoteId === id) {
        setActiveNoteId(null)
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  return {
    notes,
    activeNoteId,
    setActiveNoteId,
    createNote,
    updateNote,
    deleteNote
  }
}