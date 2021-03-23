/**
 * Fields in a request to update a single note item.
 */
export interface UpdateNoteRequest {
  name: string
  dayOfWeek: string
  done: boolean
}
