import { BatchGetItemCommand, DeleteItemCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../lib/dynamo-client";
import { logExpection, verifyAndThrowStatusError } from "../../lib/utils";
import { CartItem, CartModel } from "./cart-model";
import { MenuItem, MenuModel } from "../menu/menu-model";


export class CartEntity {

  async add(userId: string, menuId: string, qty: number): Promise<void> {
    try {
      const cartModel = new CartModel();
      const command = cartModel.add(userId, menuId, qty);
      const response = await dynamoDB.send(new PutItemCommand(command));
      verifyAndThrowStatusError(response);
    } catch (e) {
      throw logExpection('CartEntity - add to cart expection', e);
    }
  }

  async remove(userId: string, menuId: string): Promise<boolean> {
    try {
      const cartModel = new CartModel();
      const command = cartModel.remove(userId, menuId);
      const response = await dynamoDB.send(new DeleteItemCommand(command));
      verifyAndThrowStatusError(response);
      return true;
    } catch (e) {
      throw logExpection('CartEntity - remove to cart expection', e);
    }
  }

  async listWithMenu(userId: string): Promise<CartItem[]> {
    try {
      const cartModel = new CartModel();
      const command = cartModel.listQuery(userId);
      const response = await dynamoDB.send(new QueryCommand(command));
      verifyAndThrowStatusError(response);

      const menuDetailKeys: { PK: any; SK: { S: string; }; }[] = [];

      let items = response.Items.map((attribute: any) => {
        const menuKey = cartModel.getMenuKey(attribute.SK.S);
        const menuId = MenuModel.getIdFromKey(menuKey);
        const [menuPK, menuSK] = MenuModel.getKeyFromId(menuId);
        menuDetailKeys.push({
          PK: { S: menuPK },
          SK: { S: menuSK }
        });

        const item: CartItem = cartModel.getObjectFromAttributeMap<CartItem>(attribute);
        item.menuId = menuId;
        return item;
      });

      const batchResponse = await dynamoDB.send(new BatchGetItemCommand({
        RequestItems: {
          [cartModel.tableName]: {
            Keys: menuDetailKeys
          }
        }
      }));
      const menuResponses = batchResponse.Responses[cartModel.tableName];

      const menuIdMap: Map<string, MenuItem> = new Map();
      const menuItemModal = new MenuModel();
      menuResponses.map((attribute: any) => {
        const menuId = MenuModel.getIdFromKey(attribute.SK.S);
        menuIdMap.set(menuId, menuItemModal.getObjectFromAttributeMap<MenuItem>(attribute))
      });

      items = items.map((item: CartItem) => {
        item.detail = menuIdMap.get(item.menuId);
        return item;
      });

      return items;
      
    } catch (e) {
      console.log(e);
      throw logExpection(`CartEntity - viewing cart item expection from userId:${userId}`, e);
    }
  }
}
