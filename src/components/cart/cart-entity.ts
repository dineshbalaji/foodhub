import { DeleteItemCommand, GetItemCommand, GetItemCommandOutput, PutItemCommand, PutItemCommandOutput, QueryCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../lib/dynamo-client";
import { logExpection, verifyAndThrowStatusError } from "../../lib/utils";
import { CartItem, CartModel } from "./cart-model";


export class CartEntity {

  async add(userId:string, menuId:string, qty:number):Promise<void> {

    try {
      const cartModel = new CartModel();
      const command = cartModel.add(userId,menuId,qty); 
      const response = await dynamoDB.send(new PutItemCommand(command));
      verifyAndThrowStatusError(response);
    } catch (e) {
      throw logExpection('CartEntity - add to cart expection', e);
    }
  }

  async remove(userId:string, menuId:string):Promise<boolean> {
    try {
      const cartModel = new CartModel();
      const command = cartModel.remove(userId,menuId); 
      const response = await dynamoDB.send(new DeleteItemCommand(command));
      verifyAndThrowStatusError(response);
      return true;
    } catch (e) {
      throw logExpection('CartEntity - remove to cart expection', e);
    }
  }

  async list(restId:string=''):Promise<CartItem[]> {
    return [new CartItem()]
  }
}