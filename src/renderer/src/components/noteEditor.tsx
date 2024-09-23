import React from 'react';
import MarkdownEditor from './editor/MDxEditor';
import { useNoteContext } from '../NoteContext';

interface Note {
  id: string;
  title: string;
  content: string;
}

interface NoteEditorProps {
  note: Note;
}

export function NoteEditor({ note }: NoteEditorProps) {
  const { updateNote } = useNoteContext();

  const handleContentChange = (content: string) => {
    const title = content.split('\n')[0].replace(/^# /, '') || 'Untitled';
    updateNote(note.id, { content, title });
  };

  return (
    <div className="w-full h-[100vh]">
      <MarkdownEditor
        key={note.id}
        initialContent={note.content}
        onContentChange={handleContentChange}
      />
    </div>
  );
}