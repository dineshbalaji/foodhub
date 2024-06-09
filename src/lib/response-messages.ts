export interface ErrorResPayload {
    statusCode:number;
}
export class ErrorResponse extends Error {
    statusCode:number = 500;
    constructor(public message:string, { statusCode }: ErrorResPayload){
        super(message)
        this.message = message;
        this.statusCode = statusCode;
    }
}
export class SuccessResponse {
    statusCode:number = 200;
    constructor (public message:string, public data?:any) {
        this.data = data;
    }
}
