import logger from "../../lib/logger";
import { ErrorResponse } from "../../lib/response-messages";
import { OrderEntity } from "./order-entity";
import { OrderInfo } from "./order-model";

export class OrderController {
  constructor(private orderEntity: OrderEntity = new OrderEntity()) { }

  async placeOrders(userId: string = ''): Promise<void> {
    try {
      await this.orderEntity.placeOrder(userId);
    } catch (e: any) {
      logger.error('Unable place order from cart items', e);
      if (e instanceof ErrorResponse) {
        throw e;
      }
      throw new ErrorResponse(`Unable place order from cart items`, { statusCode: 500 });
    }
  }
  async history(userId: string = ''): Promise<OrderInfo[]> {
    try {
      const orders = await this.orderEntity.orderHistoryByUserId(userId);
      return orders;
    } catch (e: any) {
      logger.error('Unable remove from cart', e);
      if (e instanceof ErrorResponse) {
        throw e;
      }
      throw new ErrorResponse(`Unable add to cart`, { statusCode: 500 });
    }
  }
}