import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { UpdateNoteRequest } from '../../requests/UpdateNoteRequest'
import { updateNote } from '../../businessLogic/notes'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateNoteHandler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Log API calls
  logger.info('Update a note for current user', event)

  // DONE: Update a note item with the provided id using values in the "updatedNote" object
  const noteId = event.pathParameters.noteId
  const updatedNote: UpdateNoteRequest = JSON.parse(event.body)

  // Get auth token for user
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  await updateNote(noteId, updatedNote, jwtToken)

  return {
    statusCode: 204,
    body: ''
  }
})

handler.use(
  cors({
    credentials: true
  })
)
