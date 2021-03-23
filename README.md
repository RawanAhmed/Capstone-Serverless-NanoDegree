# Serverless Daily Notes Application

Serverless daily notes you can add it name and days also uplaod photos.


## Functionality of the application

- [x] **A user can login to daily notes application **
- [x] **can Add notes and repeated days for user **
- [x] **Can upload photo for every note **
- [x] **can edit data and delete notes also**

### Images
![Alt text](images/1.jpg?raw=true "Image 1")

![Alt text](images/2.jpg?raw=true "Image 2")

![Alt text](images/3.jpg?raw=true "Image 3")

![Alt text](images/4.jpg?raw=true "Image 4")


The application consists of a frontend and backend.

### How to run Frontend

To run frontend App in client folder :

- npm install 
- npm run start

OR can use docker image :

- docker build -t "$USER/$(basename $PWD)" .
- docker run -it --rm -v ${PWD}:/app -p 3000:3000 "$USER/$(basename $PWD)"

### Backend
The `backend` folder contains a serverless application that uses the [serverless framework] to deploy it as serverless :

- npm install serverless-webpack --save-dev
- npm i serverless-iam-roles-per-function@next
- npm install serverless-aws-documentation --save-dev
- npm install serverless-reqvalidator-plugin
- npm install serverless-offline --save-dev
- npm install aws-sdk
- npm install
- serverless config credentials --provider aws --key <USER_KEY> --secret <USER_SECRET> --profile <PROFILE>
- serverless deploy -v --aws-profile <PROFILE>

#### Authentication

Authentication in this application, is done through [Auth0](https://auth0.com/), Which uses asymmetrically encrypted JWT tokens.
## Postman debugging API

Can check postman collection Capstone-Serverless-App.postman_collection file.

# Daily notes items

The application stores notes items, where each note item contains the following fields:

* `noteId` (string) - a unique id for a note item
* `createdAt` (string) - date and time when an item was created
* `name` (string) - name of a note item (e.g. "learn java course")
* `dayOfWeek` (string) - day of the week on which the note is to be done (default: the day of item creation)
* `done` (boolean) - true if note item has been done, false otherwise
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a note item
* `userId` (string) - id of a user who created a note item.

# Functions implemented

The `serverless.yml` file has the following functions:

* `Auth` - a custom authorizer for API Gateway that is added to all other functions.

* `GetNotes` -  returns all notes for a current user. A user id can be extracted from a JWT token that is sent by the frontend.

* `CreateNote` - creates a new Note for a current user. The shape of data sent by a client application to this function can be found in the `CreateNoteRequest.ts` file. It receives a new Note item to be created in JSON format.

* `UpdateNote` - updates a Note item created by a current user. The shape of data sent by a client application to this function can be found in the `UpdateNoteRequest.ts` file. It receives an object that contains three fields that can be updated in a note item. The id of an item that should be updated is passed as a URL parameter.

* `DeleteNote` - deletes a Note item created by a current user. Expects an id of a Note item to remove. Also deletes any attached image from the S3 bucket.

* `GenerateUploadUrl` - returns a pre-signed URL that can be used to upload an attachment file for a Note item. An id of a user can be extracted from a JWT token passed by a client. Also deletes any previously attached image from the S3 bucket to make room for new image.

# Frontend

The `client` folder contains a web application that can use the API that should be developed in the project. The only file that you need to edit is the `config.ts` file in the `client` folder.

## Authentication

This application implements authentication via an Auth0 application. The "domain" and "client id" is copied to the `config.ts` file in the `client` folder. This project uses asymmetrically encrypted JWT tokens.

# Best practices

The following best practices, suggested in the 6th lesson of the Udacity Cloud Developer Nanodegree, have been implemented as follows:

## Logging

The starter code came with a configured [Winston](https://github.com/winstonjs/winston) logger that creates [JSON formatted](https://stackify.com/what-is-structured-logging-and-why-developers-need-it/) log statements. It can write log messages like this:

```ts
import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')

// You can provide additional information with every log statement
// This information can then be used to search for log statements in a log storage system
logger.info('User was authorized', {
  // Additional information stored with a log statement
  key: 'value'
})
```

## Local Secondary Index

To store note items, a DynamoDB table with local secondary index(es) has been used.

```yml

NotesTable:
  Type: AWS::DynamoDB::Table
  Properties:
    AttributeDefinitions:
      - AttributeName: partitionKey
        AttributeType: S
      - AttributeName: sortKey
        AttributeType: S
      - AttributeName: indexKey
        AttributeType: S
    KeySchema:
      - AttributeName: partitionKey
        KeyType: HASH
      - AttributeName: sortKey
        KeyType: RANGE
    BillingMode: PAY_PER_REQUEST
    TableName: ${self:provider.environment.NOTES_TABLE}
    LocalSecondaryIndexes:
      - IndexName: ${self:provider.environment.INDEX_NAME}
        KeySchema:
          - AttributeName: partitionKey
            KeyType: HASH
          - AttributeName: indexKey
            KeyType: RANGE
        Projection:
          ProjectionType: ALL # What attributes will be copied to an index

```

## Using Query()

The `query()` method is used to query an index as follows:

```ts
await this.dynamoDBClient
  .query({
    TableName: 'table-name',
    IndexName: 'index-name',
    KeyConditionExpression: 'paritionKey = :paritionKey',
    ExpressionAttributeValues: {
      ':paritionKey': partitionKeyValue
    }
  })
  .promise()
```
## URLS

- GET - https://wwk9yr7qd0.execute-api.us-east-2.amazonaws.com/dev/notes
- POST - https://wwk9yr7qd0.execute-api.us-east-2.amazonaws.com/dev/notes
- PATCH - https://wwk9yr7qd0.execute-api.us-east-2.amazonaws.com/dev/notes/{noteId}
- DELETE - https://wwk9yr7qd0.execute-api.us-east-2.amazonaws.com/dev/notes/{noteId}
- POST - https://wwk9yr7qd0.execute-api.us-east-2.amazonaws.com/dev/notes/{noteId}/attachment
