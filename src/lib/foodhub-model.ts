import { GetItemCommandOutput, GetItemOutput } from '@aws-sdk/client-dynamodb';
import { randomBytes } from 'crypto';


export enum EntityTypes {
    USER_INFO = 'UserInfo',
    USER_SESSION = 'UserSession',
    MENU_ITEM = 'MenuItem',
    RESTAURANT = 'Restaurant',
    USER_CART = 'CartItem'
}

export abstract class FoodHubModel {
    private tableName: string = 'FoodHub';
    protected abstract entityType: EntityTypes;
    protected abstract hashKey: string;
    protected abstract rangeKey: string;
    protected abstract fieldType: Map<string, string>;

    public getAttributeMapFromObject(items: any = {}): any {
        const attributes: any = {};
        for (let field in items) {
          const attrName = field.toUpperCase();
          const attrType: string | undefined = this.fieldType.get(field);
          attrType && (attributes[attrName] = { [attrType]: items[field] });
        }
        return {
            TableName: this.tableName,
            Item: {
                PK: { S: this.hashKey },
                SK: { S: this.rangeKey },
                ENTITYTYPE: { S: this.entityType },
                ...attributes
            }
        }
    }
    public getObjectFromAttributeMap<T>(attributes: any ): T {
        
        const obj: any = {};
        for (let [field, attrType] of this.fieldType.entries()) {
            const attrName = field.toUpperCase();
            const attrValue: any = attributes[attrName];

            attrValue[attrType] && (obj[field] = attrValue[attrType]);
        }
        return obj as T;
    }

    public findById() {
        return {
            TableName: this.tableName,
            Key: {
                PK: { S: this.hashKey },
                SK: { S: this.rangeKey }
            }
        }
    }
    public findByEntityType(entityType:EntityTypes) {
        return {
            TableName: this.tableName,
            IndexName: 'EntityType-GSI',
            KeyConditionExpression: 'ENTITYTYPE = :entityType',
            ExpressionAttributeValues: {
                ':entityType': { S: entityType }
            }
        }
    }

    protected generateId(prefix: string): string {
        const randomNumber = randomBytes(3).toString('hex');
        return `${prefix}${randomNumber}`;
    }
}