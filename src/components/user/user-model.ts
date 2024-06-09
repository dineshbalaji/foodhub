import Joi from 'joi';
import { ErrorResponse } from '../../lib/response-messages';

export enum UserTypes {
  CUSTOMER = 1,
  RESTAURANT_OWNER = 2
};
export interface User {
  userName: string;
  password: string;
  firstName: string;
  type: UserTypes
}
export class UserModel implements User {
  userName!: string;
  password!: string;
  firstName!: string;
  [key: string]: any;
  type: UserTypes = UserTypes.CUSTOMER;

  private static schema = Joi.object({
    userName: Joi.string().min(3).max(15).regex(/^[a-zA-Z0-9._-]+$/).required(),
    firstName: Joi.string().min(6).max(30).required(),
    password: Joi.string().min(8).required(),
    type: Joi.number().valid(1, 2).required()
  });

  static isValid(user: User): boolean {
    const { error } = UserModel.schema.validate(user);
    if (error) {
      const validationErrors = error.details.map(detail => detail.message).join(', ');
      throw new ErrorResponse(`User Validation Error: ${validationErrors};`, { statusCode: 400 });
    }
    return true;
  }
}
