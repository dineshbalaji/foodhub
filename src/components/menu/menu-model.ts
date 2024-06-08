import { EntityTypes, FoodHubModel } from "../../lib/foodhub-model";
import { GetItemCommandOutput } from "@aws-sdk/client-dynamodb";

export class MenuItem {
  menuId?: string
  name!: string;
  desc!: string;
  tag!: string;
  price!: string;
  [key: string]: any;
}


export class MenuModel extends FoodHubModel {
  static readonly prefixPK: string = 'rest#';
  static readonly prefixSK: string = 'menu#';

  static getKeyFromId(id:string) {
    const [menuId, restId] = id.split('-');
    return [`${MenuModel.prefixPK}${restId}`, `${MenuModel.prefixSK}${menuId}#${restId}`];
  }
  static getIdFromKey(id:string) {
    const [,menuId, restId] = id.split('#');
    return `${menuId}-${restId}`;
  }
  

  protected entityType: EntityTypes = EntityTypes.MENU_ITEM;
  protected hashKey!: string;
  protected rangeKey!: string;
  protected fieldType = new Map([
    ['name', 'S'],
    ['desc', 'S'],
    ['tag', 'S'],
    ['price', 'S']
  ]);

  constructor() {
    super();
  }

  public addMenuItemCommand(restId:string, menuItem: MenuItem): any {
    this.hashKey = MenuModel.prefixPK+restId;
    this.rangeKey = `${this.generateId(MenuModel.prefixSK)}#${restId}`;

    return this.getAttributeMapFromObject(menuItem);
  }
  
  public removeMenuItemCommand(menuId:string) {
    const [hashKey, rangeKey] = MenuModel.getKeyFromId(menuId);
    this.hashKey = hashKey;
    this.rangeKey = rangeKey;
    return this.findById();
  }

  public getMenuItemsCommand() {
    return this.findByEntityType(this.entityType);
  }

}