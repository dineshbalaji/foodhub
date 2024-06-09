import { ListTablesCommand, DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import logger from "./logger";
import { ErrorResponse } from "./response-messages";
import { appConfig } from "../config";

const DynamoDBConfig:DynamoDBClientConfig = {
  region: process.env.AWS_DB_REGION,
  endpoint: process.env.AWS_DB_ENDPOINT,
  credentials: {
    accessKeyId: appConfig.dynamoDBAccessKey,
    secretAccessKey: appConfig.dynamoDBSecretKey
  }
};
export const dynamoDB = new DynamoDBClient(DynamoDBConfig);

export const verifyConnection = async (): Promise<boolean> => {
  try {
    const listCommand = new ListTablesCommand({});
    const res = await dynamoDB.send(listCommand);
    logger.info('dynamoDB connected and healthy', res.TableNames);
    return true;
  } catch (e) {
    logger.info('dynamoDB connection exception', e);
    throw new ErrorResponse('Unhealthy, please verify log', { statusCode: 500 });
  }
};
