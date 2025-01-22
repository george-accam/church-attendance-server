import crypto from 'crypto';

// secret key for the token
export const secretKey = crypto.randomBytes(32).toString('hex');