import { BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";

const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { AWS_DB_REGION, AWS_DB_ENDPOINT, AWS_DB_ACCESSKEY, AWS_DB_SECRETKEY } = process.env;
const DynamoDBConfig = {
  region: AWS_DB_REGION,
  endpoint: AWS_DB_ENDPOINT,
  credentials: {
    accessKeyId: AWS_DB_ACCESSKEY,
    secretAccessKey: AWS_DB_SECRETKEY
  }
};
const dynamoDB = new DynamoDBClient(DynamoDBConfig);


(async () => {
  // Inserting by default Restrauctents
  try {
    const results2 = await dynamoDB.send(new BatchWriteItemCommand({
      RequestItems: {
        'FoodHub': [
          {
            PutRequest: {
              Item: {
                PK: { S: "rest#001" },
                SK: { S: "info" },
                ENTITYTYPE: { S: 'Restaurants' },
                NAME: { S: "Sri Balaji Bhavan" },
                PHONE: { S: "+91 9791165552" },
                EMAIL: { S: 'sribalaji2008@gmail.com' }
              }
            }
          },
          {
            PutRequest: {
              Item: {
                PK: { S: "rest#002" },
                SK: { S: "info" },
                ENTITYTYPE: { S: 'Restaurants' },
                NAME: { S: "Sangeetha Bhavan" },
                PHONE: { S: "+91 9791165234" },
                EMAIL: { S: 'sangeetha2001@gmail.com' }
              }
            }
          },
          {
            PutRequest: {
              Item: {
                PK: { S: "rest#001" },
                SK: { S: "menu#1234#001" },
                ENTITYTYPE: { S: 'MenuItem' },
                NAME: { S: "Plain Dosai" },
                DESC: { S: "A mouthwatering golden brown dosa made of rice and lentil batter with a crispy exterior texture, served with a spicy sambar and chutneys" },
                PRICE: { N: '100' },
                TAG: { S: 'VEG' },
                MENUSTATUS: { S: 'active' }
              }
            }
          },
          {
            PutRequest: {
              Item: {
                PK: { S: "rest#001" },
                SK: { S: "menu#5875#001" },
                ENTITYTYPE: { S: 'MenuItem' },
                NAME: { S: "Rava Dosai" },
                DESC: { S: "A scrumptious dosa made of mildly spiced semolina batter and garnished with diced cashews, served with sambar, tomato and coconut chutneys" },
                PRICE: { N: '150' },
                TAG: { S: 'VEG' },
                MENUSTATUS: { S: 'active' }
              }
            }
          },
          {
            PutRequest: {
              Item: {
                PK: { S: "user#dinesh20" },
                SK: { S: "cart#menu#5875#001" },
                ENTITYTYPE: { S: 'CartItem' },
                QTY: { N: '2' }
              }
            }
          },
          {
            PutRequest: {
              Item: {
                PK: { S: "order#23423" },
                SK: { S: "info" },
                ENTITYTYPE: { S: 'OrderInfo' },
                ORDERUSERID: { S: 'dinesh20' },
                CREATEDAT: { S: '2020-06-21T19:10:01' },
                STATUS: { S: 'initiated' },
                TOTALPRICE: { N: '200' }
              }
            }
          },
          {
            PutRequest: {
              Item: {
                PK: { S: "order#23423" },
                SK: { S: "menu#1234#001" },
                ENTITYTYPE: { S: 'OrderItem' },
                QTY: { N: '1' },
                DETAIL: {
                  M: {
                    NAME: { S: "Plain Dosai" },
                    DESC: { S: "A mouthwatering golden brown dosa made of rice and lentil batter with a crispy exterior texture, served with a spicy sambar and chutneys" },
                    PRICE: { N: '100' },
                    TAG: { S: 'VEG' }
                  }
                }
              }
            }
          }
        ]
      }
    }));

    console.log(results2);

  } catch (err) {
    console.error(err);
  }
})();
export { dynamoDB };
