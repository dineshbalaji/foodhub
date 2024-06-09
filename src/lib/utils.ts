import logger from "./logger";

export const verifyAndThrowStatusError = (response:any, {checkItem=false, checkItems=false }={}) => {
    if ( (checkItem && !response?.Item) || (checkItems && !response?.Items?.length) || response.$metadata.httpStatusCode !== 200) {
        throw 'Http status code has failure OR reponse item unavilable';
    }
}
export const logExpection = (message: string, e?: any) => {
    logger.error(`${message},${e}`);
    return message;
}