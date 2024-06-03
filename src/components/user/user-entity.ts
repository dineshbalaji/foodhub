import { GetItemCommand, GetItemCommandOutput, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../lib/dynamo-client";
import { randomBytes } from 'crypto';
import logger from "../../lib/logger";
import Joi from 'joi';
import { ErrorResponse } from "../../lib/response-messages";



abstract class FoodHubModal {
  private tableName:string = 'FoodHub';

  private hashKey!: string;
  private rangeKey!: string;
  private entityType!:string;
  


  private generateId(prefix:string): string {
    const randomNumber = randomBytes(3).toString('hex');
    return `${prefix}${randomNumber}`;
  }

  protected constructor(prefix: string, entityType: string, sk?: string, pk?: string) {
    const id: string = this.generateId(prefix);
    this.hashKey = pk || id;
    this.rangeKey = sk || id;
    this.entityType = entityType;
    return this;
  }

  protected getAttributeMap(items: any = {}): any {
    return {
      TableName: this.tableName,
      Item: {
        PK: { S: this.hashKey },
        SK: { S: this.rangeKey },
        EntityType: { S: this.entityType },
        ...items
      }
    }
  }
  public findById() {
    return {
      TableName: this.tableName,
      Key: {
        PK: { S: this.hashKey},
        SK: { S: this.rangeKey}
      }
    }
  }
}

export class User {
  userName!: string;
  password!: string;
  firstName!: string;
  sessionId?: string;
  [key:string]:any

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
  private static prefix: string = 'user#'
  private static entityType: string = 'User'
  private static getUserIdByName(name: string): string {
    return UserModal.prefix + name;
  }

  private userName!: string;

  constructor( userName:string ) {

    const { prefix, entityType, getUserIdByName } = UserModal;
    const userId = getUserIdByName(userName);
    super(prefix,entityType,userId, userId);
    this.userName = userName;
  }
  
  private fieldType = new Map([
    ['userName','S'],
    ['password','S'],
    ['firstName','S']
  ]);
  
  public override getAttributeMap(user: User): any {
    const attributes:any = {USERNAME: { S: this.userName }};

    for( let field in user) {
      const attrName = field.toUpperCase();
      const attrType:string | undefined = this.fieldType.get(field);
      attrType && (attributes[attrName] = { [attrType]: user[field] });
    }
    return super.getAttributeMap(attributes);
  }

  
  public getUser(response:GetItemCommandOutput): User|null {

    if(response.$metadata.httpStatusCode !==200 || !response.Item) {
      return null;
    }

    const attributes = response.Item;
    const user:User = new User();

    for( let [field, attrType] of this.fieldType.entries()) {
      const attrName = field.toUpperCase();
      const attrValue = attributes[attrName]? [attrType]: null;

      attrValue && (user[field] = attrValue);
    }

    return user as User;
  }
}


export class UserEntity {

  async addUser(user: User): Promise<boolean> {
    try {
      const userModal = new UserModal(user.userName);
      const putCommandInput =  userModal.getAttributeMap(user);

      const response = await dynamoDB.send(new PutItemCommand({...putCommandInput}));
      return response.$metadata.httpStatusCode === 200;
      
    } catch (e) {
      logger.error('UserEntity - addUser Expection', e);
      throw 'UserEntity - AddUser Expection';
    }
  }

  async getUserByName(name: string): Promise<User | null> {
    try {
      const userModal = new UserModal(name);
      const response = await dynamoDB.send(new GetItemCommand(userModal.findById()));
      return userModal.getUser(response);
    } catch (e) {
      logger.error('UserEntity - getUserByName Exception', e);
      throw 'UserEntity - AddUser Expection';
    }
  }

}