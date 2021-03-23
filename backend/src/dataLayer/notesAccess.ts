import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { NoteItem } from '../models/NoteItem'
import { NoteUpdate } from '../models/NoteUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.IMAGES_S3_BUCKET

export class NoteAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly notesTable = process.env.NOTES_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX
  ) { }

  async getAllNotes(userId: string): Promise<NoteItem[]> {
    console.log('Getting all notes')

    const result = await this.docClient.query({
      TableName: this.notesTable,
      IndexName: this.userIdIndex, // For faster query retrival
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ScanIndexForward: false // To retrive latest notes at the top
    }).promise()

    const items = result.Items
    return items as NoteItem[]
  }

  async createNote(noteItem: NoteItem): Promise<NoteItem> {
    await this.docClient.put({
      TableName: this.notesTable,
      Item: noteItem
    }).promise()

    return noteItem
  }

  async updateNote(noteId: string, userId: string, noteUpdate: NoteUpdate): Promise<NoteUpdate> {
    await this.docClient.update({
      TableName: this.notesTable,
      Key: {
        noteId,
        userId
      },
      UpdateExpression: 'set #n = :name, done = :done, dayOfWeek = :dayOfWeek',
      ExpressionAttributeValues: {
        ':name': noteUpdate.name,
        ':done': noteUpdate.done,
        ':dayOfWeek': noteUpdate.dayOfWeek
      },
      ExpressionAttributeNames: { '#n': 'name' },
      ReturnValues: 'UPDATED_NEW',
    }).promise()

    return noteUpdate
  }

  async deleteNote(noteId: string, userId: string): Promise<void> {
    // DONE: If item has image, delete attached image from s3
    // Get Note item of interest
    const result = await this.docClient.get({
      TableName: this.notesTable,
      Key: {
        noteId,
        userId
      }
    }).promise()

    if (result) {
      if (result.Item.attachmentUrl) {
        // Get ending of URL
        const imageUrl = result.Item.attachmentUrl
        const imageKey = imageUrl.substring(imageUrl.lastIndexOf('/') + 1)

        console.log('Deleting attached image from s3: ', imageKey)

        // Use function to delete image from s3
        deleteS3AttachedImage(bucketName, imageKey)
      }
    }

    await this.docClient.delete({
      TableName: this.notesTable,
      Key: {
        noteId,
        userId
      }
    }).promise()
  }

  async setAttachmentUrl(noteId: string, userId: string, attachmentUrl: string): Promise<void> {
    // DONE: If pre-existing image, delete attached image from s3
    // Get Note item of interest
    const result = await this.docClient.get({
      TableName: this.notesTable,
      Key: {
        noteId,
        userId
      }
    }).promise()

    if (result) {
      if (result.Item.attachmentUrl) {
        // Get ending of URL
        const imageUrl = result.Item.attachmentUrl
        const imageKey = imageUrl.substring(imageUrl.lastIndexOf('/') + 1)

        console.log('Deleting attached image from s3: ', imageKey)

        // Use function to delete image from s3
        deleteS3AttachedImage(bucketName, imageKey)
      }
    }

    await this.docClient.update({
      TableName: this.notesTable,
      Key: {
        noteId,
        userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      },
      ReturnValues: 'UPDATED_NEW'
    }).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}

// Function deletes an object from an s3 bucket
function deleteS3AttachedImage(bucket: string, key: string) {
  s3.deleteObject({ Bucket: bucket, Key: key }, function (err, data) {
    if (err) console.log(err, err.stack) // an error occurred
    else console.log(data) // successful response
  })
}
