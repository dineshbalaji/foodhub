import { Request, Response, NextFunction, Router } from "express";
import { SuccessResponse } from "../../lib/response-messages";
import { AuthRequest } from "../../lib/jwt-auth-token";
import { OrderController } from "./order-controller";


const router = Router();

const orderCtrl = new OrderController();

router.post('/cartItems', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await orderCtrl.placeOrders(req.userName);
    res.locals.success = new SuccessResponse('order placed from cart items');
    next();
  } catch (err) {
    next(err);
  }
})

router.get('/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await orderCtrl.history(req.userName);
    res.locals.success = new SuccessResponse('Get order history', { orders });
    next();
  } catch (err) {
    next(err);
  }
})

export default router;