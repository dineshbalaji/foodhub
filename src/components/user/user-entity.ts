import { DeleteItemCommand, GetItemCommand, GetItemCommandOutput, PutItemCommand, PutItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../lib/dynamo-client";
import { logExpection, verifyAndThrowStatusError } from "../../lib/utils";
import { User, UserModel } from "./model/user-model";
import { UserSessionModal } from "./model/user-session-model";

export class UserEntity {
  async addUser(user: User): Promise<void> {
    try {
      const userModel = new UserModel(user.userName);
      const response = await dynamoDB.send(new PutItemCommand(userModel.getAttributeMapFromObject(user)));
      verifyAndThrowStatusError(response);
    } catch (e) {
      throw logExpection('UserEntity - addUser Expection', e);
    }
  }

  async getUserByName(name: string): Promise<User | null> {
    try {
      const userModel = new UserModel(name);
      const response = await dynamoDB.send(new GetItemCommand(userModel.findById()));
      verifyAndThrowStatusError(response);
      return (response.Item && userModel.getObjectFromAttributeMap(response.Item));
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
      const response = await dynamoDB.send(new GetItemCommand(sessionModel.getSession(sessionId)));
      verifyAndThrowStatusError(response)
      return Boolean(response.Item);
    } catch (e) {
      throw logExpection('UserEntity - isValidUserSession Expection', e);
    }
  }
  async deleteSession(name: string, sessionId: string) {
    try {
      const sessionModel = new UserSessionModal(name);
      const deleteSession = sessionModel.deleteSession(sessionId);
      const response = await dynamoDB.send(new DeleteItemCommand(deleteSession));
      verifyAndThrowStatusError(response)
      return true;
    } catch (e) {
      throw logExpection('UserEntity - deleteSession Expection', e);
    }
  }
}