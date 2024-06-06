import Joi from 'joi';
import { FoodHubModel } from "../../../lib/foodhub-model";
import { GetItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { ErrorResponse } from '../../../lib/response-messages';

export class User {
  userName!: string;
  password!: string;
  firstName!: string;
  [key: string]: any

  private static schema = Joi.object({
    userName: Joi.string().min(3).max(15).regex(/^[a-zA-Z0-9._-]+$/).required(),
    firstName: Joi.string().min(6).max(18).required(),
    password: Joi.string().min(8).required()
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

  protected entityType: string = 'UserInfo'
  protected hashKey: string;
  protected rangeKey: string;

  private userName!: string;

  constructor(userName: string) {
    super();
    this.hashKey = this.prefix + userName;
    this.rangeKey = this.prefix + userName;
  }

  private fieldType = new Map([
    ['userName', 'S'],
    ['password', 'S'],
    ['firstName', 'S']
  ]);

  public override getAttributeMap(user: User): any {
    const attributes: any = { USERNAME: { S: this.userName } };

    for (let field in user) {
      const attrName = field.toUpperCase();
      const attrType: string | undefined = this.fieldType.get(field);
      attrType && (attributes[attrName] = { [attrType]: user[field] });
    }
    return super.getAttributeMap(attributes);
  }


  public getUser(response: GetItemCommandOutput): User | null {

    if (response.$metadata.httpStatusCode !== 200 || !response.Item) {
      return null;
    }

    const attributes = response.Item;
    const user: User = new User();

    for (let [field, attrType] of this.fieldType.entries()) {
      const attrName = field.toUpperCase();
      const attrValue: any = attributes[attrName];

      attrValue[attrType] && (user[field] = attrValue[attrType]);
    }

    return user as User;
  }
}