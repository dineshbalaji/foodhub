const {AWS_DB_REGION,AWS_DB_ENDPOINT,AWS_DB_ACCESSKEY,AWS_DB_SECRETKEY } = process.env;

export const DynamoDBConfig = {
    region: AWS_DB_REGION,
    endpoint:  AWS_DB_ENDPOINT,
    credentials: {
        accessKeyId: AWS_DB_ACCESSKEY,
        secretAccessKey: AWS_DB_SECRETKEY
    }
};
export const appConfig = {
    get port():number {
        return (Number(process.env.PORT) || 3000)
    },
    get sessionExpireMin():number {
        return (Number(process.env.SESSION_EXPIRE_MIN) || 15)
    },
    get jwtSecret():string {
        if(!process.env.JWT_SECRET) { throw 'JWT token must to be define in ENV_VAR'}
        return String(process.env.JWT_SECRET);
    } 
}