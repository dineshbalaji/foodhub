import { QueryCommand, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../lib/dynamo-db-client";
import { logExpection, verifyAndThrowStatusError } from "../../lib/utils";
import { CartEntity } from "../cart/cart-entity";
import { CartItem } from "../cart/cart-model";
import { OrderInfoCommand, OrderItemCommand } from "./order-command";
import { MenuCommand } from "../menu/menu-command";
import { CartCommand } from "../cart/cart-command";
import { OrderInfo } from "./order-model";
import logger from "../../lib/logger";

export class OrderEntity {
  async placeOrder(userId: string) {
    try {
      const cartEntity = new CartEntity()
      const cartItem: CartItem[] = await cartEntity.listWithMenu(userId);
      if (!cartItem.length) {
        throw 'Cart Empty';
      }

      const totalPrice = cartItem.reduce((prev: number, item: CartItem) => (prev + Number(item.detail?.price)), 0)
      const orderInfoCmd = new OrderInfoCommand()
      const addInfoCommand = orderInfoCmd.add(userId, totalPrice);

      const transactions = [];
      transactions.push({ Put: addInfoCommand });

      const orderItemCmd = new OrderItemCommand();
      const menuItemCmd = new MenuCommand();
      const cartCmd = new CartCommand();

      const orderKey = addInfoCommand.Item.PK.S;
      cartItem.forEach(item => {
        const [, menuKey] = MenuCommand.getKeyFromId(item.menuId)
        const detail = menuItemCmd.getAttributeMapFromObject(item.detail).Item;
        delete detail.PK;
        delete detail.SK;
        const orderItemCommand = orderItemCmd.add(orderKey, menuKey, item.qty, detail);
        transactions.push({ Put: orderItemCommand });

        const deleteCartCommand = cartCmd.remove(userId, item.menuId);
        transactions.push({ Delete: deleteCartCommand });
      });

      const command = new TransactWriteItemsCommand({
        TransactItems: transactions
      });
      const reponse = await dynamoDB.send(command);
      verifyAndThrowStatusError(reponse);
    }
    catch (e) {
      throw logExpection('OrderEntity - place order from cart item expection', e);
    }
  }

  async orderHistoryByUserId(userId: string): Promise<OrderInfo[]> {
    try {
      const orderInfoCmd = new OrderInfoCommand();
      const command = orderInfoCmd.findOrderByUserId(userId);
      const response = await dynamoDB.send(new QueryCommand(command));
      verifyAndThrowStatusError(response, { checkItems: true });

      const orderItemCmd = new OrderItemCommand();
      const menuCmd = new MenuCommand();

      const orderPromises = (response.Items || []).map(async (attribute: any) => {
        const orderKey = attribute.PK.S;
        const orderInfo: OrderInfo = orderInfoCmd.getObjectFromAttributeMap<OrderInfo>(attribute);
        orderInfo.orderId = orderKey.split('#')[1];

        const queryCmd = orderItemCmd.listQuery(orderInfo.orderId || '');
        const response = await dynamoDB.send(new QueryCommand(queryCmd));
        orderInfo.menuItems = (response.Items || []).map((item: any) => menuCmd.getObjectFromAttributeMap(item.DETAIL.M));

        return orderInfo;
      })

      const orders = await Promise.all(orderPromises);
      return orders;
    } catch (e) {
      logger.info('OrderEntity - order history expection', e);
      return [];
    }
  }
}
