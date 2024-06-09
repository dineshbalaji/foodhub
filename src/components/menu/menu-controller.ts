import logger from "../../lib/logger";
import { ErrorResponse } from "../../lib/response-messages";
import { MenuEntity } from './menu-entity';
import { MenuItem } from './menu-model';

export class MenuController {
  constructor(private menuEntity: MenuEntity = new MenuEntity()) { }

  async addMenuItem(restId: string, menuItem: MenuItem): Promise<void> {
    try {
      await this.menuEntity.add(restId, menuItem);
    } catch (e: any) {
      logger.error('Unable to add new MenuItem', e);
      if (e instanceof ErrorResponse) {
        throw e;
      }
      throw new ErrorResponse(`Unable to add new menu items, try sometime later`, { statusCode: 500 });
    }
  }
  async removeMenuItem(menuId: string): Promise<void> {
    try {
      
      await this.menuEntity.remove(menuId);
    } catch (e: any) {
      logger.error('Unable to remove MenuItem', e);
      if (e instanceof ErrorResponse) {
        throw e;
      }
      throw new ErrorResponse(`Unable to remove menu items, try sometime later`, { statusCode: 500 });
    }
  }
  async getAllMenuItems(restId?:string): Promise<MenuItem[]> {
    try {
      const menuItems: MenuItem[] = await this.menuEntity.list();
      return menuItems;
    } catch (e: any) {
      logger.error('Unable to list MenuItems', e);
      if (e instanceof ErrorResponse) {
        throw e;
      }
      throw new ErrorResponse(`Unable to list Menu Items, try sometime later`, { statusCode: 500 });
    }
  }
}