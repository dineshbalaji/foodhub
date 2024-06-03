export interface ErrorResPayload {
    statusCode:number;
}
export class ErrorResponse extends Error {

    public statusCode:number;
    constructor(public message:string, { statusCode }: ErrorResPayload){
        super(message)
        this.message = message;
        this.statusCode = statusCode;
    }
}

export class SuccessResponse {
    public statusCode:number = 200;

    constructor (public message:string, public data?:any) {
        this.data = data;
    }
}
