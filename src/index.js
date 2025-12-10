import dotenv from "dotenv"; // to be done in this file only
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config(); // to be done in this file only

connectDB() // async function returns a Promise
  .then(() => {
    // START THE SERVER HERE ITSELF, RIGHT AFTER DB CONNECTION

    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`App is listening on port ${port}!`);
    });
  })
  .catch((error) => {
    console.error("MONGODB CONNECTION ERROR:", error);
    process.exit(1); // STOP SERVER
  });
