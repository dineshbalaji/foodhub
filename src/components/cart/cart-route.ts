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
    res.locals.success = new SuccessResponse('Item removed from Cart');
    next();
  } catch (err) {
    next(err);
  }
})

router.get('/list', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = await cartCtrl.listCartItems(req.userName);
    res.locals.success = new SuccessResponse('Listed cart items', { items });
    next();
  } catch (err) {
    next(err);
  }
})

export default router;