import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  let token = req.cookies?.access_token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    const candidate = req.headers.authorization.split(' ')[1];
    if (candidate && candidate !== 'undefined' && candidate !== 'null') {
      token = candidate;
    }
  }
  
  if (!token) return next(errorHandler(401, 'Unauthorized'));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(403, 'Forbidden'));

    req.user = user;
    next();
  });
};

export const verifyTokenOptional = (req, res, next) => {
  let token = req.cookies?.access_token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    const candidate = req.headers.authorization.split(' ')[1];
    if (candidate && candidate !== 'undefined' && candidate !== 'null') {
      token = candidate;
    }
  }

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!err && user) {
      req.user = user;
    }
    next();
  });
};
