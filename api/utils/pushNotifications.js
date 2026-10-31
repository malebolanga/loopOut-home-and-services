import fs from 'node:fs';
import path from 'node:path';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import User from '../models/user.model.js';

const normalizeServiceAccount = (account) => {
  if (typeof account.private_key === 'string') {
    account.private_key = account.private_key
      .replace(/^-----[^\n]+-----/, '-----BEGIN PRIVATE KEY-----')
      .replace(/-----[^\n]+-----\n?$/, '-----END PRIVATE KEY-----\n')
      .replace(/\\n/g, '\n');
  }
  return account;
};

const getAdminApp = () => {
  const existing = getApps().find((app) => app.name === '[DEFAULT]');
  if (existing) return existing;

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const localApiCredential = path.resolve(process.cwd(), 'firebase-service-account.json');
  const localRootCredential = path.resolve(process.cwd(), '..', 'firebase-service-account.json');
  let credential;

  if (rawServiceAccount) {
    credential = cert(normalizeServiceAccount(JSON.parse(rawServiceAccount)));
  } else if (credentialPath && fs.existsSync(credentialPath)) {
    credential = cert(normalizeServiceAccount(JSON.parse(fs.readFileSync(credentialPath, 'utf8'))));
  } else if (fs.existsSync(localApiCredential)) {
    credential = cert(normalizeServiceAccount(JSON.parse(fs.readFileSync(localApiCredential, 'utf8'))));
  } else if (fs.existsSync(localRootCredential)) {
    credential = cert(normalizeServiceAccount(JSON.parse(fs.readFileSync(localRootCredential, 'utf8'))));
  } else if (credentialPath) {
    credential = applicationDefault();
  } else {
    throw new Error('Firebase Admin credentials are not configured.');
  }

  return initializeApp({
    credential,
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'central-cinema-218106',
  });
};

export const sendPushNotificationToUser = async (userId, { title, body, data = {}, channelId = 'loopout_updates' }) => {
  const user = await User.findById(userId).select('+pushTokens').lean();
  const tokens = [...new Set((user?.pushTokens || []).map((entry) => entry.token).filter(Boolean))].slice(0, 500);
  if (!tokens.length) return { sentCount: 0, failureCount: 0, skipped: 'no_registered_devices' };

  const messageData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined && value !== null).map(([key, value]) => [key, String(value)])
  );
  const messaging = getMessaging(getAdminApp());
  const result = await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: messageData,
    android: {
      priority: 'high',
      notification: { channelId, sound: 'default', icon: 'ic_stat_loopout' },
    },
  });

  const invalidTokens = result.responses.flatMap((response, index) => {
    const code = response.error?.code;
    return !response.success && ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(code)
      ? [tokens[index]]
      : [];
  });
  if (invalidTokens.length) {
    await User.updateOne({ _id: userId }, { $pull: { pushTokens: { token: { $in: invalidTokens } } } });
  }

  return { sentCount: result.successCount, failureCount: result.failureCount };
};
