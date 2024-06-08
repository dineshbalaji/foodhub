import { EntityTypes, FoodHubModel } from "../../lib/foodhub-model";
import { MenuItem, MenuModel } from "../menu/menu-model";

export class CartItem  {
  qty!: number;
  menuId!: string;
  detail?:MenuItem;
}


export class CartModel extends FoodHubModel {
  private readonly prefixPK: string = 'user#';
  private readonly prefixSK: string = 'cart#';

  protected entityType: EntityTypes = EntityTypes.USER_CART;
  protected hashKey!: string;
  protected rangeKey!: string;
  protected fieldType = new Map([
    ['qty', 'N']
  ]);

  public add(userId:string,menuId:string, qty:number) {
    this.hashKey = this.prefixPK+userId;
    this.rangeKey = this.prefixSK+ MenuModel.getKeyFromId(menuId)[1];

    return this.getAttributeMapFromObject({qty});
  }
  public remove(userId:string,menuId:string) {
    this.hashKey = this.prefixPK+userId;
    this.rangeKey = this.prefixSK+MenuModel.getKeyFromId(menuId)[1];

    return this.findById();
  }
  public listQuery(userId:string) {
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
  public getMenuKey(cartId:string) {
    return cartId.slice(this.prefixSK.length)
  }

}