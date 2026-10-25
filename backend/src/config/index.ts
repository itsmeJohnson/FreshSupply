import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://apple@localhost:5432/freshsupply_db',
  jwtSecret: process.env.JWT_SECRET || 'freshsupply_default_secret_jwt_key',
  nodeEnv: process.env.NODE_ENV || 'development',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
};
