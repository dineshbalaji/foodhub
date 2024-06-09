import { BatchGetItemCommand, DeleteItemCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";

import { dynamoDB } from "../../lib/dynamo-db-client";
import { logExpection, verifyAndThrowStatusError } from "../../lib/utils";
import { CartItem, SearchId } from "./cart-model";
import { MenuItem } from "../menu/menu-model";
import { CartCommand } from "./cart-command";
import { MenuCommand } from "../menu/menu-command";
import logger from "../../lib/logger";

export class CartEntity {
  async add(userId: string, menuId: string, qty: number): Promise<void> {
    try {
      const cartCmd = new CartCommand();
      const addItemCmd = cartCmd.add(userId, menuId, qty);
      const response = await dynamoDB.send(new PutItemCommand(addItemCmd));
      verifyAndThrowStatusError(response);
    } catch (e) {
      throw logExpection('CartEntity - add to cart expection', e);
    }
  }

  async remove(userId: string, menuId: string): Promise<boolean> {
    try {
      const cartCmd = new CartCommand();
      const command = cartCmd.remove(userId, menuId);
      const response = await dynamoDB.send(new DeleteItemCommand(command));
      verifyAndThrowStatusError(response);
      return true;
    } catch (e) {
      throw logExpection('CartEntity - remove to cart expection', e);
    }
  }
  async listWithMenu(userId: string): Promise<CartItem[]> {
    try {
      const cartCmd = new CartCommand();
      const command = cartCmd.listQuery(userId);
      const response = await dynamoDB.send(new QueryCommand(command));
      verifyAndThrowStatusError(response, { checkItems:true });

      const menuDetailKeys: { PK: any; SK: { S: string; }; }[] = [];
      
      let items = (response.Items || []).map((attribute: any) => {
        const menuKey = cartCmd.getMenuKey(attribute.SK.S);
        const menuId = MenuCommand.getIdFromKey(menuKey);
        const [menuPK, menuSK] = MenuCommand.getKeyFromId(menuId);
        menuDetailKeys.push({
          PK: { S: menuPK },
          SK: { S: menuSK }
        });

        const item: CartItem = cartCmd.getObjectFromAttributeMap<CartItem>(attribute);
        item.menuId = menuId;
        return item;
      });

      const batchResponse = await dynamoDB.send(new BatchGetItemCommand({
        RequestItems: {
          [cartCmd.tableName]: {
            Keys: menuDetailKeys
          }
        }
      }));
      if(!batchResponse.Responses) {
        throw `Couldn't retrieve MenuItem response from carts`;
      }
      const menuResponses = batchResponse.Responses[cartCmd.tableName];

      const menuIdMap: Map<string, MenuItem> = new Map();
      const menuItemCmd = new MenuCommand();
      menuResponses.forEach((attribute: any) => {
        const menuId = MenuCommand.getIdFromKey(attribute.SK.S);
        menuIdMap.set(menuId, menuItemCmd.getObjectFromAttributeMap<MenuItem>(attribute))
      });

      return items.map((item: CartItem) => {
        item.detail = menuIdMap.get(item.menuId);
        return item;
      });
    } catch (e) {
      logger.info(`CartEntity - viewing cart item expection from userId:${userId}`, e);
      return [];
    }
  }
}
