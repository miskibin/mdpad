export interface Note {
    id: string;
    title: string;
    content: string;
  }
  
  export type GetNotes = () => Promise<Note[]>;
  export type ReadNote = (id: string) => Promise<Note>;
  export type WriteNote = (note: Note) => Promise<void>;
  export type CreateNote = (note: Omit<Note, 'id'>) => Promise<string>;
  export type DeleteNote = (id: string) => Promise<void>;