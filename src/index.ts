import express,{ Request, Response, NextFunction, Errback} from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import UserRouter from './components/user/user-route';
import MenuRouter from './components/menu/menu-route';
import CartRouter from './components/cart/cart-route';
import { verifyUserToken } from './lib/jwt-auth';
import { UserTypes } from './components/user/model/user-model';

const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/user', UserRouter);
app.use('/menu', verifyUserToken(UserTypes.RESTAURANT_OWNER), MenuRouter);
app.use('/cart', verifyUserToken(UserTypes.CUSTOMER), CartRouter);

app.get('/', function(req:Request, res:Response) {
    res.send('<p>Healthy</p>');
});

app.use((req:Request,res:Response, next:NextFunction)=> {
    if (res.locals.success) {
        const { statusCode, message, data } = res.locals.success
        res.status(statusCode).json({ message,data })
    }
});

app.use((error:any,req:Request, res:Response, next:NextFunction):void => {
    res.status(error.statusCode || 500).json({ message: error.message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
