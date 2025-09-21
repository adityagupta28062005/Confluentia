const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/process-mapper', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error('Database connection error:', error);
        console.error('❌ Database connection error:', error);
        process.exit(1);
    }
};

module.exports = { connectDB };