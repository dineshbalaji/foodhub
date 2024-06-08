import { Request, Response, NextFunction, Router } from "express";
import { SuccessResponse } from "../../lib/response-messages";
import { UserController } from "./user-controller";
import { User } from "./model/user-model";
import { AuthRequest, verifyUserToken } from "../../lib/jwt-auth";
import { UserEntity } from "./user-entity";

const router = Router();
const userCtrl:UserController = new UserController();

router.post('/register', async(req:Request<any>, res:Response, next:NextFunction)=> {
    const { userName, password, firstName, type }:User = req.body;

    try {
       await userCtrl.registerUser({userName, password, firstName, type });
       res.locals.success = new SuccessResponse('User Registered');
       next();
    } catch(err) {
        next(err);
    }
})

router.post('/login', async(req:Request, res:Response, next:NextFunction) => {
    try {
        const { userName, password } = req.body;
        const token:String = await userCtrl.createUserSession({ userName, password} as User);
        res.locals.success = new SuccessResponse('User Verified', { token });
        next();
    } catch(err) {
        next(err);
    }
})
router.get('/logout', verifyUserToken(), async(req:AuthRequest, res:Response, next:NextFunction) => {
    try {
        const { userName='', sessionId='' } = req;
        await userCtrl.deleteUserSession(userName, sessionId);
        res.locals.success = new SuccessResponse('User logged out');
        next();
    } catch(err) {
        next(err);
    }
})

export default router;