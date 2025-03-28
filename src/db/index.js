import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


// connect to database
const ConnectDB = async () => {
  try {
    
    // console.log(`${process.env.MONGO_URL},${DB_NAME}`);
    const ConnectionInstance = await mongoose.connect(
      `${process.env.MONGO_URL}/${DB_NAME}`
    );
    console.log(
      `MONGODB Conntected Successfully ${ConnectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB Connection Failed", error);
    process.exit(1);
  }
};

export default ConnectDB;
