import { randomBytes } from 'crypto';

export enum EntityTypes {
    USER_INFO = 'UserInfo',
    USER_SESSION = 'UserSession',
    MENU_ITEM = 'MenuItem',
    RESTAURANT = 'Restaurant',
    USER_CART = 'CartItem',
    ORDER_INFO = 'OrderInfo',
    ORDER_ITEM = 'OrderItem'
}

export abstract class FoodHubCommand {
    public readonly tableName: string = 'FoodHub';

    protected abstract entityType: EntityTypes;
    protected abstract hashKey: string;
    protected abstract rangeKey: string;
    protected abstract fieldType: Map<string, string>;

    protected generateId(prefix: string): string {
        const randomNumber = randomBytes(3).toString('hex');
        return `${prefix}${randomNumber}`;
    }

    getAttributeMapFromObject(items: any = {}): any {
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
    getObjectFromAttributeMap<T>(attributes: any): T {
        const obj: any = {};
        for (let [field, attrType] of this.fieldType.entries()) {
            const attrName = field.toUpperCase();
            const attrValue: any = attributes[attrName] || {};

            attrValue[attrType] && (obj[field] = attrValue[attrType]);
        }
        return obj as T;
    }
    findById() {
        return {
            TableName: this.tableName,
            Key: {
                PK: { S: this.hashKey },
                SK: { S: this.rangeKey }
            }
        }
    }
    findByMenuStatus(status: string) {
        return {
            TableName: this.tableName,
            IndexName: 'MenuItem-GSI',
            KeyConditionExpression: 'MENUSTATUS = :menuStatus',
            ExpressionAttributeValues: {
                ':menuStatus': { S: status }
            }
        }
    }
    findOrderByUserId(userName: string) {
        return {
            TableName: this.tableName,
            IndexName: 'OrderByUserId',
            KeyConditionExpression: 'ORDERUSERID = :userName',
            ExpressionAttributeValues: {
                ':userName': { S: userName }
            }
        }
    }
}