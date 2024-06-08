import { DeleteItemCommand, GetItemCommand, GetItemCommandOutput, PutItemCommand, PutItemCommandOutput, QueryCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../lib/dynamo-client";
import { logExpection, verifyAndThrowStatusError } from "../../lib/utils";
import { MenuItem, MenuModel } from "./menu-model";

export class MenuEntity {

  async add(restId:string,menuItem:MenuItem):Promise<void> {
    try {
      const menuItemModal:MenuModel = new MenuModel();
      const putMenuItemCommand = menuItemModal.addMenuItemCommand(restId,menuItem);
      const response = await dynamoDB.send(new PutItemCommand(putMenuItemCommand));
      verifyAndThrowStatusError(response);
    } catch (e) {
      throw logExpection('MenuEntity - add menu expection', e);
    }
  }

  async remove(menuId:string):Promise<boolean> {
    try {
      const menuItemModal:MenuModel = new MenuModel();
      const command = menuItemModal.removeMenuItemCommand(menuId);
      const response = await dynamoDB.send(new DeleteItemCommand(command));
      verifyAndThrowStatusError(response);
      return true;
    } catch (e) {
      throw logExpection('MenuEntity - remove menu expection', e);
    }
  }

  async update(menuId:string):Promise<boolean> {
    //TODO
    return true;
  }

  async list():Promise<MenuItem[]> {
    try{
      const menuItemModal:MenuModel = new MenuModel();
      const command = menuItemModal.getMenuItemsCommand();
      const response = await dynamoDB.send(new QueryCommand(command));
      verifyAndThrowStatusError(response);
  
      return response.Items.map((attribute:any) => {
        const menuItem:MenuItem = menuItemModal.getObjectFromAttributeMap<MenuItem>(attribute);
        menuItem.menuId = MenuModel.getIdFromKey(attribute.SK.S);
        return menuItem;
      })
    } catch (e) {
      throw logExpection('MenuEntity - list menu expection', e);
    }
  }
}