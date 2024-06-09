import { EntityTypes, FoodHubCommand } from "../../lib/foodhub-command";
import {MenuItem, MenuStatus } from './menu-model';

export class MenuCommand extends FoodHubCommand {
  static readonly prefixPK: string = 'rest#';
  static readonly prefixSK: string = 'menu#';

  static getKeyFromId(id:string) {
    const [menuId, restId] = id.split('-');
    return [`${MenuCommand.prefixPK}${restId}`, `${MenuCommand.prefixSK}${menuId}#${restId}`];
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
    ['price', 'N'],
    ['menuStatus', 'S'],
  ]);

  addMenuItemCommand(restId:string, menuItem: MenuItem): any {
    this.hashKey = MenuCommand.prefixPK+restId;
    this.rangeKey = `${this.generateId(MenuCommand.prefixSK)}#${restId}`;
    menuItem.menuStatus = MenuStatus.ACTIVE;
    return this.getAttributeMapFromObject(menuItem);
  }
  removeMenuItemCommand(menuId:string) {
    const [hashKey, rangeKey] = MenuCommand.getKeyFromId(menuId);
    this.hashKey = hashKey;
    this.rangeKey = rangeKey;
    return this.findById();
  }
  getMenuItemsCommand() {
    return this.findByMenuStatus(MenuStatus.ACTIVE);
  }
}