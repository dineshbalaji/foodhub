import logger from "../../lib/logger";
import { ErrorResPayload, ErrorResponse } from "../../lib/response-messages";
import { User, UserEntity } from "./user-entity";
import Joi from 'joi';




export class UserController {

  private userEntity: UserEntity;

  constructor() {
    this.userEntity = new UserEntity();
  }

  async registerUser(user:User):Promise<void> {
    try {
      

      User.isValid(user);
      const existUser = await this.userEntity.getUserByName(user.userName);
      if(existUser) {
        throw new ErrorResponse('Please try different User Name', {statusCode: 400})
      }

      const success = await this.userEntity.addUser(user);
      if(!success){
        throw 'Http status code has failure';
      }

    } catch (e: any) {
      logger.error('Unable to register User', e);
      if (e instanceof ErrorResponse) {
        throw e;
      }
      throw new ErrorResponse(`Unable to register User, try sometime later`, { statusCode: 500 });
    }
  }
   async tokenCreation() {
    /*const user = await userModal.findOne({ where: { userName } });
    if (user && await passwordCompare(password, user.password)) {
        return createToken({ userId: user.id });
    } else {
        throw new ErrorResponse(`Username or password incorrect`, { statusCode: 401 });
    }*/
  }

}