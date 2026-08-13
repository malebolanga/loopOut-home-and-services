// Jest mock for firebase-admin/auth  
export const getAuth = () => ({ verifyIdToken: async () => { throw new Error('Firebase Admin not configured in test environment'); } }); 
