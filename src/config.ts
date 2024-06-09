const { PORT,SESSION_EXPIRE_MIN,AWS_DB_SECRETKEY,AWS_DB_ACCESSKEY } = process.env;

export const appConfig = {
    get port():number {
        return (Number(PORT) || 3000)
    },
    get sessionExpireMin():number {
        return (Number(SESSION_EXPIRE_MIN) || 15)
    },
    get jwtSecret():string {
        if(!process.env.JWT_SECRET) { throw 'JWT token must to be define in ENV_VAR'}
        return String(process.env.JWT_SECRET);
    },
    get dynamoDBAccessKey():string {
        if(!AWS_DB_ACCESSKEY) { throw 'dynamoDB AWS_DB_ACCESSKEY must to be define in ENV_VAR'}
        return AWS_DB_ACCESSKEY;
    },
    get dynamoDBSecretKey():string {
        if(!AWS_DB_SECRETKEY) { throw 'dynamoDB AWS_DB_SECRETKEY must to be define in ENV_VAR'}
        return AWS_DB_SECRETKEY;
    }
}