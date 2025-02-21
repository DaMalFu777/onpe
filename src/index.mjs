import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, GetCommand, UpdateCommand, DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  const { httpMethod, pathParameters, body } = event;
  const id = pathParameters?.id;

  try {
    switch (httpMethod) {
      case 'POST':
        const item = JSON.parse(body);
        await docClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: item
        }));
        return { statusCode: 200, body: JSON.stringify(item) };

      case 'GET':
        const { Item } = await docClient.send(new GetCommand({
          TableName: TABLE_NAME,
          Key: { id }
        }));
        return { statusCode: 200, body: JSON.stringify(Item) };

      case 'PUT':
        const data = JSON.parse(body);
        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { id },
          UpdateExpression: 'SET #data = :data',
          ExpressionAttributeNames: { '#data': 'data' },
          ExpressionAttributeValues: { ':data': data }
        }));
        return { statusCode: 200, body: JSON.stringify(data) };

      case 'DELETE':
        await docClient.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { id }
        }));
        return { statusCode: 204 };

      default:
        return { statusCode: 400, body: 'Invalid method' };
    }
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: err.message };
  }
};
