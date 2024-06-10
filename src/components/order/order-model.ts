import { MenuItem } from "../menu/menu-model";

export enum OrderStatus  {
  INITIATED = 'Initiated'
}
export interface OrderInfo {
  orderId?:string;
  orderUserId:string;
  status:string;
  createdAt:string;
  totalPrice:number
  items?:OrderItem[];
}
export interface OrderItem {
  qty:number;
  detail:MenuItem
}
