import { GetItemCommand, GetItemCommandOutput, PutItemCommand, PutItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../lib/dynamo-client";
import { randomBytes } from 'crypto';
import logger from "../../lib/logger";
import Joi from 'joi';
import { ErrorResponse } from "../../lib/response-messages";


const verifyAndThrowStatusError = (response: PutItemCommandOutput | GetItemCommandOutput) => {
  if (response.$metadata.httpStatusCode !== 200) {
    throw 'Http status code has failure';
  }
}
const logExpection = (message:string, e?:any) => {
  logger.error(message, e);
  return message;
}

abstract class FoodHubModal {
  private tableName: string = 'FoodHub';
  protected abstract entityType: string;
  protected abstract hashKey: string;
  protected abstract rangeKey: string;

  protected getAttributeMap(items: any = {}): any {
    return {
      TableName: this.tableName,
      Item: {
        PK: { S: this.hashKey },
        SK: { S: this.rangeKey },
        ENTITYTYPE: { S: this.entityType },
        ...items
      }
    }
  }
  public findById() {
    return {
      TableName: this.tableName,
      Key: {
        PK: { S: this.hashKey },
        SK: { S: this.rangeKey }
      }
    }
  }

  protected generateId(prefix: string): string {
    const randomNumber = randomBytes(3).toString('hex');
    return `${prefix}${randomNumber}`;
  }
}

export class User {
  userName!: string;
  password!: string;
  firstName!: string;
  sessionId?: string;
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


class UserModal extends FoodHubModal {
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

class UserSessionModal extends FoodHubModal {
  private prefixPK: string = 'user#'
  private prefixSK: string = 'session#'

  protected entityType: string = 'UserSession';
  protected hashKey: string;
  protected rangeKey!: string;

  constructor(userName: string) {
    super();
    this.hashKey = this.prefixPK + userName;
    return this;
  }
  get sessionId(): string {
    return this.rangeKey;
  }
  set sessionId(id: string) {
    this.rangeKey = id;
  }
  addSession(ttl: number) {
    this.rangeKey = this.generateId(this.prefixSK);
    return this.getAttributeMap({
      TTL: { N: ttl }
    });
  }
}

export class UserEntity {

  async addUser(user: User): Promise<void> {
    try {
      const userModal = new UserModal(user.userName);
      const response = await dynamoDB.send(new PutItemCommand(userModal.getAttributeMap(user)));
      verifyAndThrowStatusError(response);
    } catch (e) {
      throw logExpection('UserEntity - addUser Expection', e);
    }
  }

  async getUserByName(name: string): Promise<User | null> {
    try {
      const userModal = new UserModal(name);
      const response = await dynamoDB.send(new GetItemCommand(userModal.findById()));
      return userModal.getUser(response);
    } catch (e) {
      throw logExpection('UserEntity - getUserByName Expection', e);
    }
  }

  async addUserSession(name: string, ttl: number): Promise<string> {
    try {
      const sessionModel = new UserSessionModal(name);
      const response = await dynamoDB.send(new PutItemCommand(sessionModel.addSession(ttl)));
      verifyAndThrowStatusError(response);
      return sessionModel.sessionId;
    } catch (e) {
      throw logExpection('UserEntity - addUserSession Expection', e);
    }
  }
  async isValidUserSession(name: string, sessionId: string): Promise<boolean> {
    try {
      const sessionModel = new UserSessionModal(name);
      sessionModel.sessionId = sessionId;
      const response = await dynamoDB.send(new GetItemCommand(sessionModel.findById()));
      verifyAndThrowStatusError(response)
      return Boolean(response.Item);
    } catch (e) {
      throw logExpection('UserEntity - isValidUserSession Expection', e);
    }
  }
  async deleteSession(name: string, sessionId: string, ttl: number) {}
}