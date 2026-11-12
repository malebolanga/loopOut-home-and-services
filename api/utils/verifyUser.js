import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
import User from '../models/user.model.js';

const accountStatusCache = new Map();
const ACCOUNT_STATUS_CACHE_MS = 10_000;

export const invalidateAccountStatusCache = (userId) => accountStatusCache.delete(String(userId));

export const verifyToken = async (req, res, next) => {
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

  try {
    const cacheKey = String(verifiedUser.id);
    let accountStatus = accountStatusCache.get(cacheKey);
    if (!accountStatus || accountStatus.expiresAt <= Date.now()) {
      const account = await User.findById(cacheKey).select('accountStatus').lean();
      if (!account) return next(errorHandler(401, 'Account not found.'));
      accountStatus = { value: account.accountStatus || 'active', expiresAt: Date.now() + ACCOUNT_STATUS_CACHE_MS };
      accountStatusCache.set(cacheKey, accountStatus);
    }
    if (accountStatus.value === 'suspended') return next(errorHandler(403, 'This account is suspended. Contact LoopOut support for help.'));
  } catch (error) {
    return next(error);
  }

  req.user = verifiedUser;
  next();
};

export const verifyTokenOptional = async (req, res, next) => {
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
        const account = await User.findById(user.id).select('accountStatus').lean();
        if (!account || account.accountStatus === 'suspended') continue;
        req.user = user;
        break;
      }
    } catch (err) {
      // Continue to next candidate
    }
  }

  next();
};
