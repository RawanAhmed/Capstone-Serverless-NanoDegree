import * as uuid from 'uuid'

import { NoteItem } from '../models/NoteItem'
import { NoteUpdate } from '../models/NoteUpdate'

import { NoteAccess } from '../dataLayer/notesAccess'

import { CreateNoteRequest } from '../requests/CreateNoteRequest'
import { UpdateNoteRequest } from '../requests/UpdateNoteRequest'

import { parseUserId } from '../auth/utils'

const noteAccess = new NoteAccess()

export async function getAllNotes(jwtToken: string): Promise<NoteItem[]> {
  const userId = parseUserId(jwtToken) // Use pre-made function
  return noteAccess.getAllNotes(userId)
}

export async function createNote(createNoteRequest: CreateNoteRequest, jwtToken: string): Promise<NoteItem> {
  const userId = parseUserId(jwtToken) // Use pre-made function
  const itemId = uuid.v4()

  return await noteAccess.createNote({
    noteId: itemId,
    userId: userId,
    name: createNoteRequest.name,
    dayOfWeek: createNoteRequest.dayOfWeek,
    createdAt: new Date().toISOString(),
    done: false
  })
}

export async function updateNote(noteId: string, updateNoteRequest: UpdateNoteRequest, jwtToken: string): Promise<NoteUpdate> {
  const userId = parseUserId(jwtToken) // Use pre-made function
  return await noteAccess.updateNote(noteId, userId, updateNoteRequest)
}

export async function deleteNote(noteId: string, jwtToken: string): Promise<void> {
  const userId = parseUserId(jwtToken) // Use pre-made function
  return await noteAccess.deleteNote(noteId, userId)
}

export async function setAttachmentUrl(noteId: string, attachmentUrl: string, jwtToken: string): Promise<void> {
  const userId = parseUserId(jwtToken) // Use pre-made function
  return await noteAccess.setAttachmentUrl(noteId, userId, attachmentUrl)
}
