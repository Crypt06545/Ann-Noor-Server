import dotenv from "dotenv";

dotenv.config();
import app from "./src/app.js";
import ConnectDB from "./src/db/index.js";

const PORT = process.env.PORT || 8000;

ConnectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on Port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Connection Failed!!", err);
  });
