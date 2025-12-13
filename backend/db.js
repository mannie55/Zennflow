import mongoose from "mongoose";
import config from "./utils/config.js";
import logger from "./utils/logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    logger.info("connected to MongoDB");
  } catch (error) {
    logger.error("error connection to MongoDB:", error.message);
  }
};

export { connectDB };
