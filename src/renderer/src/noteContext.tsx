import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Note {
  id: string;
  title: string;
  content: string;
}

interface NoteContextType {
  notes: Note[];
  activeNoteId: string | null;
  theme: 'light' | 'dark';
  setActiveNoteId: (id: string | null) => void;
  createNote: () => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleTheme: () => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const loadedNotes = await window.context.getNotes();
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const createNote = async () => {
    const newNote = {
      title: 'New Note',
      content: '# New Note\n\nStart typing here...'
    };
    try {
      const id = await window.context.createNote(newNote);
      setNotes([...notes, { ...newNote, id }]);
      setActiveNoteId(id);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const updatedNote = { ...notes.find(note => note.id === id), ...updates } as Note;
      await window.context.writeNote(updatedNote);
      setNotes(notes.map(note => note.id === id ? updatedNote : note));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await window.context.deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
      if (activeNoteId === id) {
        setActiveNoteId(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <NoteContext.Provider value={{
      notes,
      activeNoteId,
      theme,
      setActiveNoteId,
      createNote,
      updateNote,
      deleteNote,
      toggleTheme
    }}>
      {children}
    </NoteContext.Provider>
  );
}

export const useNoteContext = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNoteContext must be used within a NoteProvider');
  }
  return context;
};