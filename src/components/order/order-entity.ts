import { QueryCommand, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../lib/dynamo-client";
import { logExpection, verifyAndThrowStatusError } from "../../lib/utils";
import { OrderInfo, OrderInfoModel, OrderItemModel } from "./order-model";
import { MenuModel } from "../menu/menu-model";
import { CartEntity } from "../cart/cart-entity";
import { CartItem, CartModel } from "../cart/cart-model";


export class OrderEntity {

  async placeOrder(userId: string) {
    try {
      const cartEntity = new CartEntity()
      const cartItem: CartItem[] = await cartEntity.listWithMenu(userId);
      if (!cartItem.length) {
        throw 'Cart Empty';
      }

      const totalPrice = cartItem.reduce((prev: number, item: CartItem) => (prev + Number(item.detail?.price)), 0)
      const orderInfoModal = new OrderInfoModel()
      const addInfoCommand = orderInfoModal.add(userId, totalPrice);

      const transactions = [];
      transactions.push({ Put: addInfoCommand });

      const orderItemModel = new OrderItemModel();
      const menuItemModal = new MenuModel();
      const cartModel = new CartModel();

      const orderKey = addInfoCommand.Item.PK.S;
      cartItem.forEach(item => {
        const [, menuKey] = MenuModel.getKeyFromId(item.menuId)
        const detail = menuItemModal.getAttributeMapFromObject(item.detail).Item;
        delete detail.PK;
        delete detail.SK;
        const orderItemCommand = orderItemModel.add(orderKey, menuKey, item.qty, detail);
        transactions.push({ Put: orderItemCommand });

        const deleteCartCommand = cartModel.remove(userId, item.menuId);
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

  async orderHistoryByUserId(userId: string):Promise<OrderInfo[]> {
    try {
      const orderInfoModal = new OrderInfoModel();
      const command = orderInfoModal.findOrderByUserId(userId);
      const response = await dynamoDB.send(new QueryCommand(command));
      verifyAndThrowStatusError(response);

      const orderItemModel = new OrderItemModel();
      const menuModel = new MenuModel();

      const orderPromises = response.Items.map(async (attribute: any) => {
        const orderKey = attribute.PK.S;
        const orderInfo: OrderInfo = orderInfoModal.getObjectFromAttributeMap<OrderInfo>(attribute);
        orderInfo.orderId = orderKey.split('#')[1];

        const orderItemCmd = orderItemModel.listQuery(orderInfo.orderId || '');
        const response = await dynamoDB.send(new QueryCommand(orderItemCmd));
        orderInfo.menuItems = response.Items.map((item: any) => menuModel.getObjectFromAttributeMap(item.DETAIL.M));

        return orderInfo;
      })

      const orders = await Promise.all(orderPromises);
      return orders;
    } catch (e) {
      throw logExpection('OrderEntity - order history expection', e);
    }
  }
}
