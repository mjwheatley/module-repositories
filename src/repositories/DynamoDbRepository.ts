import * as AWS from 'aws-sdk';
import { DeleteItemOutput, GetItemOutput, PutItemOutput } from 'aws-sdk/clients/dynamodb';
import { AWSError } from 'aws-sdk';

export abstract class DynamoDbRepository<T> {
  protected client: AWS.DynamoDB.DocumentClient;

  constructor(protected tableName: string = ``) {
    let dynamoOptions = undefined;
    if (!!process.env.IS_OFFLINE) {
      dynamoOptions = {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
        accessKeyId: 'DEFAULT_ACCESS_KEY',  // needed if you don't have aws credentials at all in env
        secretAccessKey: 'DEFAULT_SECRET' // needed if you don't have aws credentials at all in env
      };
    }
    this.client = new AWS.DynamoDB.DocumentClient(dynamoOptions);
  }

  abstract toDomainObject(dataObject: any): T;

  abstract toDataObject(domainObject: T): any;

  save(model: T): Promise<PutItemOutput> {
    return new Promise((resolve, reject) => {
      const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
        TableName: this.tableName,
        Item: this.toDataObject(model)
      };
      this.client.put(params, (error: AWSError, output: PutItemOutput) => {
        if (error) {
          reject(error);
        } else {
          resolve(output);
        }
      });
    });
  }

  get(id: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
        TableName: this.tableName,
        Key: { id }
      };
      this.client.get(params, (error: AWSError, result: GetItemOutput) => {
        if (error) {
          reject(error);
        } else if (result.Item) {
          let item = this.toDomainObject(result.Item);
          resolve(item);
        } else {
          console.error(`Item[${id}] not found in Table[${this.tableName}]`);
          reject(new Error(`Item not found`));
        }
      });
    });
  }

  delete(id: string): Promise<DeleteItemOutput> {
    return new Promise((resolve, reject) => {
      const params: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
        TableName: this.tableName,
        Key: { id }
      };
      this.client.delete(params, (error: AWSError, result: DeleteItemOutput) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}
