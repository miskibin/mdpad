import React from 'react';
import { NoteProvider, useNoteContext } from './NoteContext';
import { Sidebar } from './components/sidebar';
import { NoteEditor } from './components/noteEditor';
import { FileText } from 'lucide-react';

function AppContent() {
  const { notes, activeNoteId, theme } = useNoteContext();
  const activeNote = notes.find((note) => note.id === activeNoteId);

  return (
    <div className={`flex h-screen bg-background text-foreground ${theme}`}>
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        {activeNote ? (
          <NoteEditor note={activeNote} />
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
    </div>
  );
}

export default function App() {
  return (
    <NoteProvider>
      <AppContent />
    </NoteProvider>
  );
}