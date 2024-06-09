import express, { Request, Response, NextFunction } from 'express';
import logger from 'morgan';

import UserRouter from './components/user/user-route';
import MenuRouter from './components/menu/menu-route';
import CartRouter from './components/cart/cart-route';
import OrderRouter from './components/order/order-route';

import { verifyAuthToken } from './lib/jwt-auth-token';
import { verifyConnection } from './lib/dynamo-db-client';
import { ErrorResponse, SuccessResponse } from './lib/response-messages';
import { insertRestaurants } from './default-data';
import { UserTypes } from './components/user/user-model';

const app = express();
app.use(logger('combined'));
app.use(express.json());

if(process.env.NODE_ENV === 'development') {
    insertRestaurants();
}

app.use('/user', UserRouter);
app.use('/menu', MenuRouter);
app.use('/cart', verifyAuthToken(UserTypes.CUSTOMER), CartRouter);
app.use('/order', verifyAuthToken(UserTypes.CUSTOMER), OrderRouter);

app.get('/health', async function (req: Request, res: Response, next: NextFunction) {
    try {
        await verifyConnection();
        res.locals.success = new SuccessResponse('Healthy', { statusCode: 200 });
        next()
    } catch (e) {
        next(e);
    }
});
app.use((req: Request, res: Response, next: NextFunction) => {
    if (res.locals.success) {
        const { statusCode, message, data } = res.locals.success
        res.status(statusCode).json({ message, data })
    } else {
        next(new ErrorResponse('Unknown API request', { statusCode: 400 }));
    }
});
app.use((error: any, req: Request, res: Response, next: NextFunction): void => {
    res.status(error.statusCode || 500).json({ message: error.message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
