import { randomBytes } from 'crypto';

export abstract class FoodHubModel {
    private tableName: string = 'FoodHub';
    protected abstract entityType: string;
    protected abstract hashKey: string;
    protected abstract rangeKey: string;

    protected getAttributeMap(items: any = {}): any {
        return {
            TableName: this.tableName,
            Item: {
                PK: { S: this.hashKey },
                SK: { S: this.rangeKey },
                ENTITYTYPE: { S: this.entityType },
                ...items
            }
        }
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

    protected generateId(prefix: string): string {
        const randomNumber = randomBytes(3).toString('hex');
        return `${prefix}${randomNumber}`;
    }
}