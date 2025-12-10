import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config();

connectDB()
  .then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`App is listening on port ${port}!`);
    });
  })
  .catch((error) => {
    console.error("MONGODB CONNECTION ERROR:", error);
    process.exit(1); // STOP SERVER
  });
