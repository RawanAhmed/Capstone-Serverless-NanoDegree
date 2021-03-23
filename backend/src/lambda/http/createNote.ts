import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { CreateNoteRequest } from '../../requests/CreateNoteRequest'
import { createNote } from '../../businessLogic/notes'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createNoteHandler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Log API calls
  logger.info('Create a note for current user', event)

  // DONE: Implement creating a new Note item
  const newNote: CreateNoteRequest = JSON.parse(event.body)

  // Get auth token for user
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const newItem = await createNote(newNote, jwtToken)

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: newItem
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
