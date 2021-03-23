import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getAllNotes } from '../../businessLogic/notes'
import { createLogger } from '../../utils/logger'


const logger = createLogger('getNotesHandler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Log API calls
  logger.info('Get notes for current user', event)

  // DONE: Get all Note items

  // Get auth token for user
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const notes = await getAllNotes(jwtToken)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: notes
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
