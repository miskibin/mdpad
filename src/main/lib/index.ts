import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { GetNotes, ReadNote, WriteNote, CreateNote, DeleteNote, Note } from '../../shared/types'

const getNotesDir = () => {
  return path.join(app.getPath('userData'), 'notes')
}

export const getNotes: GetNotes = async () => {
  const notesDir = getNotesDir()
  console.log('getNotes', notesDir)
  await fs.mkdir(notesDir, { recursive: true })
  const files = await fs.readdir(notesDir)
  const notes = await Promise.all(
    files
      .filter((file) => file.endsWith('.md'))
      .map(async (file) => {
        const filePath = path.join(notesDir, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const id = path.basename(file, '.md')
        const title = content.split('\n')[0].replace(/^# /, '') || 'Untitled'
        return { id, title, content }
      })
  )
  return notes
}

export const readNote: ReadNote = async (id) => {
  const notesDir = getNotesDir()
  const filePath = path.join(notesDir, `${id}.md`)
  const content = await fs.readFile(filePath, 'utf-8')
  const title = content.split('\n')[0].replace(/^# /, '') || 'Untitled'
  console.log('readNote', id, title, content)
  return { id, title, content }
}

export const writeNote: WriteNote = async (note) => {
  const notesDir = getNotesDir()
  console.log('writeNote', note.content)  
  const filePath = path.join(notesDir, `${note.id}.md`)
  await fs.writeFile(filePath, note.content)
}

export const createNote: CreateNote = async (note) => {
  const id = uuidv4()
  const newNote: Note = { ...note, id }
  await writeNote(newNote)
  return id
}

export const deleteNote: DeleteNote = async (id) => {
  const notesDir = getNotesDir()
  const filePath = path.join(notesDir, `${id}.md`)
  await fs.unlink(filePath)
}
