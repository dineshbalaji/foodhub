import { DeleteItemCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";

import {MenuCommand} from './menu-command';
import {MenuItem} from './menu-model';

import { dynamoDB } from "../../lib/dynamo-db-client";
import { logExpection, verifyAndThrowStatusError } from "../../lib/utils";

export class MenuEntity {

  async add(restId:string,menuItem:MenuItem):Promise<void> {
    try {
      const menuCommand:MenuCommand = new MenuCommand();
      const putMenuItemCommand = menuCommand.addMenuItemCommand(restId,menuItem);
      const response = await dynamoDB.send(new PutItemCommand(putMenuItemCommand));
      verifyAndThrowStatusError(response);
    } catch (e) {
      throw logExpection('MenuEntity - add menu expection', e);
    }
  }

  async remove(menuId:string):Promise<boolean> {
    try {
      const menuCommand:MenuCommand = new MenuCommand();
      const command = menuCommand.removeMenuItemCommand(menuId);
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
      const menuCommand:MenuCommand = new MenuCommand();
      const command = menuCommand.getMenuItemsCommand();
      const response = await dynamoDB.send(new QueryCommand(command));
      verifyAndThrowStatusError(response, { checkItems: true });
  
      return (response.Items || []).map((attribute:any) => {
        const menuItem:MenuItem = menuCommand.getObjectFromAttributeMap<MenuItem>(attribute);
        menuItem.menuId = MenuCommand.getIdFromKey(attribute.SK.S);
        return menuItem;
      })
    } catch (e) {
      throw logExpection('MenuEntity - list menu expection', e);
    }
  }
}