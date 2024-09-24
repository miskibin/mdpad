import React, { useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Plus, Moon, Sun, ChevronLeft, ChevronRight, FileText, MoreHorizontal } from 'lucide-react';
import { useNoteContext } from '../NoteContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Sidebar() {
  const { notes, activeNoteId, setActiveNoteId, createNote, updateNote, deleteNote, theme, toggleTheme } = useNoteContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={`${
        isCollapsed ? 'w-14' : 'w-60'
      } border-r border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 flex flex-col transition-all duration-300`}
    >
      <div className="p-2 flex justify-end items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="flex-grow px-1">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`group flex items-center py-1 px-2 rounded cursor-pointer ${
              activeNoteId === note.id
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-100'
            }`}
            onClick={() => setActiveNoteId(note.id)}
          >
            <FileText className={`h-4 w-4 ${isCollapsed ? 'mx-auto' : 'mr-2'}`} />
            {!isCollapsed && (
              <>
                <span className="truncate flex-1 text-sm">{note.title}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => updateNote(note.id, { title: 'New Title' })}>
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => createNote()}>
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteNote(note.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        ))}
      </ScrollArea>
      <div className="p-2 flex justify-between items-center">
        <Button
          className={`${isCollapsed ? 'w-full p-1' : 'px-2 py-1'} bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100`}
          onClick={createNote}
        >
          <Plus className={`h-4 w-4 ${isCollapsed ? 'mx-auto' : 'mr-2'}`} />
          {!isCollapsed && <span className="text-sm">New Note</span>}
        </Button>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}