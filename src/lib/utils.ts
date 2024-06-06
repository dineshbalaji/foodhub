import logger from "./logger";
import { GetItemCommandOutput, PutItemCommandOutput } from "@aws-sdk/client-dynamodb";

export const verifyAndThrowStatusError = (response: PutItemCommandOutput | GetItemCommandOutput) => {
    if (response.$metadata.httpStatusCode !== 200) {
        throw 'Http status code has failure';
    }
}
export const logExpection = (message: string, e?: any) => {
    logger.error(message, e);
    return message;
}