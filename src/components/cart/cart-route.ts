import { Request, Response, NextFunction, Router } from "express";
import { SuccessResponse } from "../../lib/response-messages";
import { AuthRequest } from "../../lib/jwt-auth";
import { CartController } from "./cart-controller";
import { CartItem } from "./cart-model";


const router = Router();

const cartCtrl = new CartController();

router.put('/add', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await cartCtrl.addToCart(req.body as CartItem, req.userName);
    res.locals.success = new SuccessResponse('Item added into Cart');
    next();
  } catch (err) {
    next(err);
  }
})

router.delete('/remove', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await cartCtrl.removeFromCart(req.body.menuId, req.userName);
    res.locals.success = new SuccessResponse('Item added into Cart');
    next();
  } catch (err) {
    next(err);
  }
})

router.get('/list', async (req: Request, res: Response, next: NextFunction) => {

})

export default router;