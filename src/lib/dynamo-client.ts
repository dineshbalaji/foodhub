const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {AWS_DB_REGION,AWS_DB_ENDPOINT,AWS_DB_ACCESSKEY,AWS_DB_SECRETKEY } = process.env;
const DynamoDBConfig = {
    region: AWS_DB_REGION,
    endpoint:  AWS_DB_ENDPOINT,
    credentials: {
        accessKeyId: AWS_DB_ACCESSKEY,
        secretAccessKey: AWS_DB_SECRETKEY
    }
};

const dynamoDB = new DynamoDBClient(DynamoDBConfig);
/*
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
(async () => {
    console.log('IIFE')
    try {
      const results = await dynamoDB.send(new ListTablesCommand({}));
      console.log('table',results.TableNames.join("\n"));

      const results2 =await dynamoDB.send(new PutItemCommand({
        TableName:'FoodHub',
        Item:{
            PK:{S:"user#001"},
            SK:{S:"user#001"},
            UserName: {S: "Dinesh"}
        }
    }));
    console.log(results2);

    } catch (err) {
      console.error(err);
    }
})();*/
export { dynamoDB };
