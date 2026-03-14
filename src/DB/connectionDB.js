import mongoose from "mongoose";
import { MONGO_URL } from "../../config/config.service.js";

const checkConnectionDB = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("Connected to Database Successfully");
  } catch (error) {
    console.log("Error connecting to Database:", error);
  }
};

export default checkConnectionDB;

