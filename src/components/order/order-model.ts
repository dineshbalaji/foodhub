import { EntityTypes, FoodHubModel } from "../../lib/foodhub-model";
import { MenuItem } from "../menu/menu-model";
import moment from 'moment'

export interface OrderInfo {
  orderId?:string;
  orderUserId:string;
  status:string;
  createdAt:string;
  totalPrice:number
  menuItems?:MenuItem[];
}
enum OrderStatus  {
  INITIATED = 'Initiated'
}
export class OrderInfoModel extends FoodHubModel {
  private readonly prefixPK: string = 'order#';
  private readonly prefixSK: string = 'info';

  protected entityType: EntityTypes = EntityTypes.ORDER_INFO;
  protected hashKey!: string;
  protected rangeKey!: string;
  protected fieldType = new Map([
    ['orderUserId', 'S'],
    ['status', 'S'],
    ['createdAt', 'S'],
    ['totalPrice', 'N']
  ]);

  public add(userId:string, totalPrice:number) {
    this.hashKey = this.generateId(this.prefixPK)
    this.rangeKey = this.prefixSK;
    return this.getAttributeMapFromObject({
      orderUserId:userId,
      status:OrderStatus.INITIATED,
      createdAt:moment().format('YYYY-MM-DD[T]HH:mm:ss'),
      totalPrice
    })
  }
}

export interface OrderItem {
  qty:number;
  detail:MenuItem
}
export class OrderItemModel extends FoodHubModel {
  private readonly prefixPK: string = 'order#';
  private readonly prefixSK: string = 'menu#';

  protected entityType: EntityTypes = EntityTypes.ORDER_ITEM;
  protected hashKey!: string;
  protected rangeKey!: string;
  protected fieldType = new Map([
    ['qty', 'N'],
    ['detail', 'M']
  ]);

  add(orderKey: string, menuKey:string, qty:number, detail:any ) {
    this.hashKey =orderKey;
    this.rangeKey =menuKey;
    return this.getAttributeMapFromObject({
      qty,
      detail
    });
  }
  public listQuery(orderId:string) {
    this.hashKey = this.prefixPK+orderId;
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
