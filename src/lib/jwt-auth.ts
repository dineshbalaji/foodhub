
import { sign, verify }  from 'jsonwebtoken';
import logger from './logger';
import { appConfig } from '../config';
import { NextFunction, Request, Response } from 'express';
import { UserEntity } from '../components/user/user-entity';
import { UserTypes } from '../components/user/model/user-model';
const { ErrorResponse } = require('./response-messages');

export interface AuthRequest extends Request {
    userName?:string
    sessionId?:string
} 
export interface AuthTokenPayload {
	userName:string
	sessionId:string
	type:number
}

export const createAuthToken = (payload:AuthTokenPayload):string => {
	try {
		return sign(payload, appConfig.jwtSecret, { expiresIn: appConfig.sessionExpireMin+'min' })
	} catch(e) {
		logger.error('createJWTToken exception', e);
		throw  'createJWTToken exception';
	}
}

export const verifyUserToken = (type?:UserTypes) => async (req:AuthRequest, res:Response, next:NextFunction) => {
	try {
		const userEntity = new UserEntity();
		const token = String(req.headers['auth-token']);
		const {userName, sessionId, type:tokenType }:AuthTokenPayload = verify(token, appConfig.jwtSecret) as AuthTokenPayload;

		if((!type || type===Number(tokenType)) && await userEntity.isValidUserSession(userName, sessionId)) {
			req.userName = userName;
			req.sessionId = sessionId;
			next();
		} else {
			throw 'User Session not available in remote';
		}
	} catch (e) {
		logger.log('Unauthorized User', e);
		next(new ErrorResponse('Unauthorized User', {statusCode: 401}));
	}
}