import logger from "../../lib/logger";
import { ErrorResponse } from "../../lib/response-messages";
import { CartEntity } from "./cart-entity";
import { CartItem } from "./cart-model";

export class CartController {
  constructor(private cartEntity: CartEntity = new CartEntity()) { }

  async addToCart(cartItem:CartItem, userId?: string): Promise<void> {
    try {
      const menuId:string = cartItem.menuId;
      const qty = cartItem.qty;
      if(userId && menuId && qty) {
        await this.cartEntity.add(userId, menuId, qty);
      } else {
        throw new ErrorResponse(`Validation Error`, { statusCode: 400 });
      }
      
    } catch (e: any) {
      logger.error('Unable add to cart', e);
      if (e instanceof ErrorResponse) {
        throw e;
      }
      throw new ErrorResponse(`Unable add to cart`, { statusCode: 500 });
    }
  }
  async removeFromCart(menuId:string, userId?: string,): Promise<void> {
    try {
      if(userId && menuId) {
        await this.cartEntity.remove(userId, menuId);
      } else {
        throw new ErrorResponse(`Validation Error`, { statusCode: 400 });
      }
    } catch (e: any) {
      logger.error('Unable remove from cart', e);
      if (e instanceof ErrorResponse) {
        throw e;
      }
      throw new ErrorResponse(`Unable add to cart`, { statusCode: 500 });
    }
  }
  async listCartItems(userId: string=''): Promise<CartItem[]> {
    try {
      const cartItems:CartItem[] = await this.cartEntity.listWithMenu(userId);
      return cartItems;
    } catch (e: any) {
      logger.error('Unable to list Cart Items', e);
      if (e instanceof ErrorResponse) {
        throw e;
      }
      throw new ErrorResponse(`Unable to list Cart Items, try sometime later`, { statusCode: 500 });
    }
  }
}