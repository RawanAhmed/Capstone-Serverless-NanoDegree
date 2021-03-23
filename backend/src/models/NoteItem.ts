export interface NoteItem {
  userId: string
  noteId: string
  createdAt: string
  name: string
  dayOfWeek: string
  done: boolean
  attachmentUrl?: string
}
