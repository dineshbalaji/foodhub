import { EntityTypes, FoodHubCommand } from "../../../lib/foodhub-command";

export class UserSessionCommand extends FoodHubCommand {
  private prefixPK: string = 'user#';
  private prefixSK: string = 'session#';

  protected entityType: EntityTypes = EntityTypes.USER_SESSION;
  protected hashKey: string;
  protected rangeKey!: string;
  protected fieldType:Map<string, string> = new Map([
    ['ttl', 'N'],
  ]);

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
    return this.getAttributeMapFromObject({ ttl });
  }
  getSession(sessionId:string) {
      this.rangeKey = sessionId;
      return this.findById();
  }
  deleteSession(sessionId: string) {
    this.rangeKey = sessionId;
    return this.findById();
  }
}