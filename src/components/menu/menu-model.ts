export enum MenuStatus {
  ACTIVE = 'active'
}
export interface MenuItem {
  menuId?: string
  name: string;
  desc: string;
  tag: string;
  price: number;
  menuStatus?:string;
  [key: string]: any;
}
