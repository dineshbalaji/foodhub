import { MenuItem } from "../menu/menu-model";

export interface SearchId {
  PK: { S: string };
  SK: { S: string };
}
export interface CartItem  {
  qty: number;
  menuId: string;
  detail?:MenuItem;
}
