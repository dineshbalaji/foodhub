import { appConfig } from "../../config";
import { createAuthToken } from "../../lib/jwt-auth";
import logger from "../../lib/logger";
import { ErrorResponse } from "../../lib/response-messages";
import { User, UserEntity } from "./user-entity";
import { hash, compare } from 'bcrypt';

export class UserController {

  constructor(private userEntity: UserEntity = new UserEntity() ) {
  }

  async registerUser(user: User): Promise<void> {
    try {
      User.isValid(user);
      const existUser = await this.userEntity.getUserByName(user.userName);
      if (existUser) {
        throw new ErrorResponse('Please try different User Name', { statusCode: 400 })
      }
      user.password = await hash(user.password, 10);

      await this.userEntity.addUser(user);
    } catch (e: any) {
      logger.error('Unable to register User', e);
      if (e instanceof ErrorResponse) {
        throw e;
      }
      throw new ErrorResponse(`Unable to register User, try sometime later`, { statusCode: 500 });
    }
  }

  private getExpireAt(updateTime?: number): number {
    const sessionExpireMin: number = appConfig.sessionExpireMin;
    const newTime = Math.floor(Date.now() / 1000) + (60 * sessionExpireMin);
    return (updateTime || newTime) + (60 * sessionExpireMin);
  }

  async createUserSession(user: User): Promise<string> {
    try {
      const existUser = await this.userEntity.getUserByName(user.userName);
      if (existUser && await compare(user.password, existUser.password)) {
        const sessionId = await this.userEntity.addUserSession(user.userName, this.getExpireAt());
        return createAuthToken({ userName: user.userName, sessionId });
      } else {
        throw new ErrorResponse('Please verify username & password', { statusCode: 400 })
      }
    } catch (e: any) {
      logger.error('Unable to Login User', e);
      if (e instanceof ErrorResponse) {
        throw e;
      }
      throw new ErrorResponse(`Unable to Login, try sometime later`, { statusCode: 500 });
    }
  }

}