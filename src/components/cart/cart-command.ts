import { EntityTypes, FoodHubCommand } from "../../lib/foodhub-command";
import { MenuCommand } from "../menu/menu-command";

export class CartCommand extends FoodHubCommand {
  private readonly prefixPK: string = 'user#';
  private readonly prefixSK: string = 'cart#';

  protected entityType: EntityTypes = EntityTypes.USER_CART;
  protected hashKey!: string;
  protected rangeKey!: string;
  protected fieldType = new Map([
    ['qty', 'N']
  ]);

  getMenuKey(cartId:string) {
    return cartId.slice(this.prefixSK.length);
  }
  add(userId:string,menuId:string, qty:number) {
    this.hashKey = this.prefixPK+userId;
    this.rangeKey = this.prefixSK+ MenuCommand.getKeyFromId(menuId)[1];

    return this.getAttributeMapFromObject({qty});
  }
  remove(userId:string,menuId:string) {
    this.hashKey = this.prefixPK+userId;
    this.rangeKey = this.prefixSK+MenuCommand.getKeyFromId(menuId)[1];

    return this.findById();
  }
  listQuery(userId:string) {
    this.hashKey = this.prefixPK+userId;
    
    return {
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :hashKey AND begins_with(SK, :prefixSK)',
      ExpressionAttributeValues: {
        ':hashKey': { S: this.hashKey },
        ':prefixSK': { S: this.prefixSK }
      }
    };
  }
}