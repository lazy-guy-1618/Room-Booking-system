require('dotenv').config();

export const config = {
  jwtSecret: process.env.JWT_SECRET || 'a_very_secure_default_secret_for_dev_purposes_only',
  jwtExpiresIn: '24h'
};
