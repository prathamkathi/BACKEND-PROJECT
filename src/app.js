import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// MIDDLEWARES
app.use(
  cors({
    // ALLOWS ALL CROSS-ORIGIN REQUESTS
    origin: process.env.CORS_ORIGIN, // CORS_ORIGIN=*
    credentials: true, // client (browser) ko cookies / auth tokens bhejne ki permission dena
  })
);
app.use(express.json({ limit: "16kb" })); // JSON body ko parse karke req.body banata hai
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // form-data (URL encoded) ko parse karke req.body banata hai
app.use(express.static("public")); // public folder ke files direct serve karta hai (images, etc)
app.use(cookieParser()); // incoming cookies ko read karke req.cookies banata hai

// ROUTES IMPORT
import userRouter from "./routes/user.route.js";

// ROUTES DECLARATION
app.use("/api/v1/users", userRouter);
// http:localhost:3000/api/v1/users/register
export { app };
