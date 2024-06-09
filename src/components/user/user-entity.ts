import { DeleteItemCommand, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../../lib/dynamo-db-client";
import { logExpection, verifyAndThrowStatusError } from "../../lib/utils";
import { User } from "./user-model";
import { UserCommand } from "./command/user-command";
import { UserSessionCommand } from "./command/user-session-command";

export class UserEntity {
  async addUser(user: User): Promise<void> {
    try {
      const userCmd = new UserCommand(user.userName);
      const response = await dynamoDB.send(new PutItemCommand(userCmd.getAttributeMapFromObject(user)));
      verifyAndThrowStatusError(response);
    } catch (e) {
      throw logExpection('UserEntity - addUser Expection', e);
    }
  }
  async getUserByName(name: string): Promise<User | undefined > {
    try {
      const userCmd = new UserCommand(name);
      const response = await dynamoDB.send(new GetItemCommand(userCmd.findById()));
      verifyAndThrowStatusError(response);
      return (response.Item && userCmd.getObjectFromAttributeMap<User>(response.Item));
    } catch (e) {
      throw logExpection('UserEntity - getUserByName Expection', e);
    }
  }
  async addUserSession(name: string, ttl: number): Promise<string> {
    try {
      const sessionCmd = new UserSessionCommand(name);
      const response = await dynamoDB.send(new PutItemCommand(sessionCmd.addSession(ttl)));
      verifyAndThrowStatusError(response);
      return sessionCmd.sessionId;
    } catch (e) {
      throw logExpection('UserEntity - addUserSession Expection', e);
    }
  }
  async isValidUserSession(name: string, sessionId: string): Promise<boolean> {
    try {
      const sessionCmd = new UserSessionCommand(name);
      const response = await dynamoDB.send(new GetItemCommand(sessionCmd.getSession(sessionId)));
      verifyAndThrowStatusError(response, {checkItem:true})
      return true;
    } catch (e) {
      throw logExpection('UserEntity - isValidUserSession Expection', e);
    }
  }
  async deleteSession(name: string, sessionId: string) {
    try {
      const sessionCmd = new UserSessionCommand(name);
      const deleteSession = sessionCmd.deleteSession(sessionId);
      const response = await dynamoDB.send(new DeleteItemCommand(deleteSession));
      verifyAndThrowStatusError(response)
      return true;
    } catch (e) {
      throw logExpection('UserEntity - deleteSession Expection', e);
    }
  }
}