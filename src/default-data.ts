import { BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "./lib/dynamo-db-client";
import logger from "./lib/logger";

export const insertRestaurants = async() => {
  try {
    const results = await dynamoDB.send(new BatchWriteItemCommand({
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
          }
        ]
      }
    }));
    logger.info('Default Restaurants data inserted');
  } catch (err) {
    logger.error('Error: Default Restaurants data insertion failed');
  }
};
