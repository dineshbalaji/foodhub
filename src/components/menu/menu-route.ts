import { Request, Response, NextFunction, Router } from "express";
import { SuccessResponse } from "../../lib/response-messages";
import { MenuController } from "./menu-controller";
import { MenuItem } from "./menu-model";
import { verifyAuthToken } from "../../lib/jwt-auth-token";
import { UserTypes } from "../user/user-model";

const router = Router();
const menuCtrl: MenuController = new MenuController();

router.put('/:restId', verifyAuthToken(UserTypes.RESTAURANT_OWNER), async (req: Request, res: Response, next: NextFunction) => {
  const menuItem: MenuItem = req.body;
  const restId = req.params.restId;

  try {
    await menuCtrl.addMenuItem(restId, menuItem);
    res.locals.success = new SuccessResponse('new Menu Added');
    next();
  } catch (err) {
    next(err);
  }
})
router.delete('/:menuId', verifyAuthToken(UserTypes.RESTAURANT_OWNER), async (req: Request, res: Response, next: NextFunction) => {
  const menuId = req.params.menuId;

  try {
    await menuCtrl.removeMenuItem(menuId);
    res.locals.success = new SuccessResponse('Menu get deleted');
    next();
  } catch (err) {
    next(err);
  }
})

router.get('/:restId', verifyAuthToken(UserTypes.CUSTOMER), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menuItems: MenuItem[] = await menuCtrl.getAllMenuItems(req.params.restId);
    res.locals.success = new SuccessResponse('Successfully get all menu items', { menuItems });
    next();
  } catch (err) {
    next(err);
  }
})

export default router;