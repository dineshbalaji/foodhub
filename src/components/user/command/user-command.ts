import { EntityTypes, FoodHubCommand } from "../../../lib/foodhub-command";

export class UserCommand extends FoodHubCommand {
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

  constructor(private userName: string) {
    super();
    this.hashKey = this.prefix + userName;
    this.rangeKey = this.prefix + userName;
    this.userName = userName;
  }
}