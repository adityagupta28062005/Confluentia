module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/process-mapper',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10mb',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads'
};