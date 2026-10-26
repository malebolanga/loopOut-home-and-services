import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  const candidateTokens = [];

  // Check Authorization header first (most explicit from SPA client)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const candidate = req.headers.authorization.split(' ')[1];
    if (candidate && candidate !== 'undefined' && candidate !== 'null') {
      candidateTokens.push(candidate);
    }
  }

  // Then check cookies
  if (req.cookies && req.cookies.access_token) {
    const cookieToken = req.cookies.access_token;
    if (cookieToken && cookieToken !== 'undefined' && cookieToken !== 'null') {
      candidateTokens.push(cookieToken);
    }
  }

  if (candidateTokens.length === 0) return next(errorHandler(401, 'Unauthorized'));

  let verifiedUser = null;
  for (const token of candidateTokens) {
    try {
      verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
      if (verifiedUser) break;
    } catch (err) {
      // Continue to next candidate
    }
  }

  if (!verifiedUser) {
    return next(errorHandler(403, 'Forbidden'));
  }

  req.user = verifiedUser;
  next();
};

export const verifyTokenOptional = (req, res, next) => {
  const candidateTokens = [];

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const candidate = req.headers.authorization.split(' ')[1];
    if (candidate && candidate !== 'undefined' && candidate !== 'null') {
      candidateTokens.push(candidate);
    }
  }

  if (req.cookies && req.cookies.access_token) {
    const cookieToken = req.cookies.access_token;
    if (cookieToken && cookieToken !== 'undefined' && cookieToken !== 'null') {
      candidateTokens.push(cookieToken);
    }
  }

  if (candidateTokens.length === 0) {
    return next();
  }

  for (const token of candidateTokens) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (user) {
        req.user = user;
        break;
      }
    } catch (err) {
      // Continue to next candidate
    }
  }

  next();
};
