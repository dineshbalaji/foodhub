const {AWS_DB_REGION,AWS_DB_ENDPOINT,AWS_DB_ACCESSKEY,AWS_DB_SECRETKEY } = process.env;

export const DynamoDBConfig = {
    region: AWS_DB_REGION,
    endpoint:  AWS_DB_ENDPOINT,
    credentials: {
        accessKeyId: AWS_DB_ACCESSKEY,
        secretAccessKey: AWS_DB_SECRETKEY
    }
};