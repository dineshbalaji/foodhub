import Joi from 'joi';
import { EntityTypes, FoodHubModel } from "../../../lib/foodhub-model";
import { GetItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { ErrorResponse } from '../../../lib/response-messages';

export enum UserTypes {
  CUSTOMER = 1,
  RESTAURANT_OWNER = 2
};
export class User {
  userName!: string;
  password!: string;
  firstName!: string;
  [key: string]: any;
  type:UserTypes =UserTypes.CUSTOMER;

  private static schema = Joi.object({
    userName: Joi.string().min(3).max(15).regex(/^[a-zA-Z0-9._-]+$/).required(),
    firstName: Joi.string().min(6).max(18).required(),
    password: Joi.string().min(8).required(),
    type: Joi.number().valid(1, 2).required()
  });

  static isValid(user: User): boolean {
    const { error } = User.schema.validate(user);
    if (error) {
      const validationErrors = error.details.map(detail => detail.message).join(', ');
      throw new ErrorResponse(`User Validation Error: ${validationErrors};`, { statusCode: 400 });
    }
    return true;
  }
}


export class UserModel extends FoodHubModel {
  private prefix: string = 'user#'

  protected entityType: EntityTypes = EntityTypes.USER_INFO
  protected hashKey: string;
  protected rangeKey: string;
  protected fieldType:Map<string, string> = new Map([
    ['userName', 'S'],
    ['password', 'S'],
    ['firstName', 'S'],
    ['type', 'S']
  ]);

  private userName!: string;

  constructor(userName: string) {
    super();
    this.hashKey = this.prefix + userName;
    this.rangeKey = this.prefix + userName;
    this.userName = userName;
  }
}