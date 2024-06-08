import { EntityTypes, FoodHubModel } from "../../../lib/foodhub-model";

export class UserSessionModal extends FoodHubModel {
  private prefixPK: string = 'user#'
  private prefixSK: string = 'session#'
  protected fieldType: Map<string, string> = new Map();

  protected entityType: EntityTypes = EntityTypes.USER_SESSION;
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
    return this.getAttributeMapFromObject({
      TTL: { N: ttl }
    });
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