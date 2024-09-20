import React, { useState } from 'react'
import { ScrollArea } from './ui/scroll-area'
import { Button } from './ui/button'
import { Plus, Moon, Sun, Trash, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

type Note = {
  id: string
  title: string
}

type SidebarProps = {
  notes: Note[]
  activeNoteId: string | null
  onNoteSelect: (noteId: string) => void
  onNoteCreate: () => void
  onNoteDelete: (noteId: string) => void
  onThemeToggle: () => void
}

export function Sidebar({
  notes,
  activeNoteId,
  onNoteSelect,
  onNoteCreate,
  onNoteDelete,
  onThemeToggle
}: SidebarProps) {
  const { theme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  return (
    <div
      className={`${isCollapsed ? 'w-16' : 'w-64'} border-r border-border bg-background flex flex-col transition-all duration-300`}
    >
      <div className="p-4 flex justify-between items-center">
        {!isCollapsed && <h1 className="text-lg font-semibold">Notes</h1>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="flex-grow">
        {notes.map((note) => (
          <div  
            key={note.id}
            className={`flex items-center p-2 cursor-pointer ${
              activeNoteId === note.id ? 'bg-accent' : 'hover:bg-accent/50'
            }`}
            onClick={() => onNoteSelect(note.id)}
          >
            <FileText className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-2'}`} />
            {!isCollapsed && (
              <>
                <span className="truncate flex-1">{note.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onNoteDelete(note.id)
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 flex justify-between items-center">
        <Button className={isCollapsed ? 'w-full p-2' : ''} onClick={onNoteCreate}>
          <Plus className={`h-4 w-4 ${isCollapsed ? 'mx-auto' : 'mr-2'}`} />
          {!isCollapsed && 'New Note'}
        </Button>
        {!isCollapsed && (
          <Button variant="ghost" size="icon" onClick={onThemeToggle}>
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  )
}
