> notes from chai aur backend from lec 5, 11- remain; trim these notes too

check versions: node -v && npm -v

API (Application Programming Interface): A set of rules that lets a client communicate with a server — like a waiter passing orders to the kitchen.
API endpoints: Specific URLs where the client sends requests (e.g., GET /login, POST /register).

## package.json

stores metadata of project like dependecies' versions, info & configurations for the project

npm init = initialize a package.json file
npm init -y = set all to default

```js
"type": "commonjs", // backend (generally)
"type": "module", // frontend (generally)
"main": "index.js", // this file loads first

// shortcut commands
"scripts": {
  "start": "node index.js", // npm run start OR npm start
  "dev": "nodemon src/index.js", // npm run start OR npm start
  // agar root file ke andar hai toh directly bhi chal jaega, no need for src/..
}
```

npm i -D nodemon : install it as a dev-dependency, not as dependency

package-lock.json file ensure karta hai ki har machine par packages ke exact same versions install hon, taaki project stable rahe

## index.js

npm i express

```js
const express = require("express"); // importing the express function (cjs)

const app = express(); // object with many diff methods

app.get("/", (req, res) => res.send("hi im root")); // get method
app.get("/login", (req, res) => res.render("login.ejs")); // get method

const port = 3000; // make sure this port is not being used anywhere else
app.listen(port, () => console.log("server listening on port: ", port)); // listen method
```

–> localhost:3000 –> root page

## dotenv

HAVE TO RESTART SERVER EVEN IF USING NODEMON

.env file stores environment variables, sensitive information, invisible to public

npm i dotenv
touch .env

```env
PORT=4000
MONGODB_URI=...
```

```js
require("dotenv").config();
// THIS SHALL GO AT THE START OF index.js

const port = process.env.PORT || 3000; // STANDARD WAY, NECESSARY FOR PRODUCTION

console.log(process.env); // many different values stored in the process.env object
```

## import-export

IMP: don't forget 'file extension name' when immporting
e.g. .js, .jsx

### ES6 Import–Export Cheatsheet

| Feature                  | Export Syntax                              | Import Syntax                                     | Notes                                                        |
| ------------------------ | ------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------ |
| Default Export           | `export default funcName;`                 | `import funcName from "./file.js";`               | Only 1 default export per file; import name can be anything. |
| Named Export (inline)    | `export const x = 10;`                     | `import { x } from "./file.js";`                  | Import name must match exactly.                              |
| Named Export (grouped)   | `const a=1; const b=2; export { a, b };`   | `import { a, b } from "./file.js";`               | Good for grouping multiple exports.                          |
| Rename on Export         | `export { login as userLogin };`           | `import { userLogin } from "./file.js";`          | Alias at export side.                                        |
| Rename on Import         | `export function login(){}`                | `import { login as authLogin } from "./file.js";` | Alias at import side.                                        |
| Default + Named Together | `export default mainFn; export const x=1;` | `import mainFn, { x } from "./file.js";`          | Very common pattern.                                         |
| Namespace Import         | `export const a=1; export const b=2;`      | `import * as Utils from "./file.js";`             | Everything accessible via Utils.\*                           |
| Re-export (barrel file)  | `export * from "./user.js";`               | `import { fn } from "./index.js";`                | Centralises exports.                                         |
| Dynamic Import           | (same exports as above)                    | `const mod = await import("./file.js");`          | Returns module object: mod.fn                                |
| CommonJS vs ES Module    | CJS: `module.exports =`                    | CJS: `require("x")`                               | ES modules need "type":"module" or .mjs                      |

## git

git init
touch .gitignore
touch public/temp/.gitkeep (for empty folder structures)

git add .
git commit -m 'commit all files'

git branch -M main
git remote add origin git@github.com:prathamkathi/repo_name.git
git push -u origin main

git push –> when origin is set

git status

## middlewares

// YET TO DO

JAANE SE PEHELE MUJHSE MILTE JANA

can do either of three:

1. end the req–res cycle by sending a 'response'
2. pass control to the next middleware/route using 'next()'
3. trigger the error-handling middleware using 'next(err)'

notes:

- MW can access req object too
- MW run even if routes don't exist, since they are written before the routes

```js
// custom middlware
app.use("/route", (req, res, next) => {
  console.log("middleware is in action");

  // res.send("mw response");
  // next();
  // return next(); // can do this too
});

// error handling middleware
```

```js
// src/app.js

// third-party middleware
app.use(
  cors({
    // ALLOWS ALL CROSS-ORIGIN REQUESTS
    origin: process.env.CORS_ORIGIN, // CORS_ORIGIN=*
    credentials: true, // client (browser) ko cookies / auth tokens bhejne ki permission dena
  })
);

// express middlewares
app.use(express.json({ limit: "16kb" })); // JSON body ko parse karke req.body banata hai
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // form-data (URL encoded) ko parse karke req.body banata hai
app.use(express.static("public")); // public folder ke files direct serve karta hai (images, etc)

// third-party middleware
app.use(cookieParser()); // incoming cookies ko read karke req.cookies banata hai
```

IMP: (req, res) –> (err, req, res, next)

## data modelling

DATABASE IS ALWAYS IN ANOTHER CONTINENT –> async-await

npm i mongoose

- mongoDB ke upar ek ODM (Object Data Modeling) library hai
- ye Node.js apps ko MongoDB se baat karna easy, structured, aur safe banata hai

eraser.io –> visual data modelling

mkdir models
cd models
touch user.model.js todo.model.js

```js
// commonjs
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(fields, { timestamps: true });
const User = mongoose.model("User", userSchema);
module.exports = User;
```

```js
// module
import mongoose from "mongoose"; // 1. import
const userSchema = new mongoose.Schema(fields, { timestamps: true }); // 2. make new schema
export const User = mongoose.model("User", userSchema); // 3. make model
```

when saving to DB:
User –> users
Todo –> todos
category –> categorys (works but not a good practice)

```js
// src/models/user.model.js

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// mini model
const addressSchema = new mongoose.Schema(
  {
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      required: false,
      trim: true,
    },
    pinCode: {
      type: Number,
      required: true,
      min: 100000,
      max: 999999,
    },
  },
  { _id: false } // id not needed here
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String, //
      required: true, //
      unique: true, //
      lowercase: true, //
      trim: true, //
      index: true, // only when necessary
    },
    password: {
      type: String, // encryption reqd
      required: [true, "password is required"], // custom validator message
    },
    isActive: Boolean, // short way
    avatar: {
      // mongoose can store images, and other small files, but it's not advised
      type: String, // stored in third-party service
    },
    address: {
      type: [addressSchema], // notice the use of mini model
      default: [],
    },
    mood: {
      type: String,
      enum: ["awesome", "neutral", "depressed"], // enumerations/choices
      default: "neutral",
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

// PASSWORD ENCRYPTION & VALIDATION

// using mongoose 'pre' hook (middleware); pre: do this before saving
userSchema.pre("save", async function (next) {
  // we want 'this', DON'T USE ARROW FUNC

  // we want to do this when saving for the first time, so use conditional
  if (!this.isModified("password")) return next(); // if object is not modified
  this.password = await bcrypt.hash(this.password, 10); // hash(what, #rounds)
  next();
});

// custom methods
userSchema.methods.isPassword = async function (password) {
  // we want 'this', DON'T USE ARROW FUNC

  // bcrypt can check password as well
  return await bcrypt.compare(password, this.password);
  // returns Boolean
};
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      // payloads go here
      _id: this._id, // needed
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id, // needed
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
```

```js
const todoSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    complete: {
      type: Boolean,
      default: false, //
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ref for ObjectId // necessary after the prev line
    },
    subTodos: [
      {
        type: mongoose.Schema.Types.ObjectId, // stores ID
        ref: "SubTodo", // reference for the ID
      },
    ], // array of sub-todos
  },
  { timestamps: true } // always put this critical schemas
);
```

```js
import mongoose from "mongoose";

// mini model
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderPrice: {
      type: Number,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderItems: {
      type: [orderItemSchema], // notice
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CANCELLED", "DELIVERED"], // enumerations/choices
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
```

## aggregation pipeline

```js
// src/models/video.model.js

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema(fields, { timestamps: true });
videoSchema.plugin(mongooseAggregatePaginate); // do this before exporting
// now we can write aggregation queries
export const Video = mongoose.model("Video", videoSchema);
```

'id' is auto. set by mongoose

## database connection

```js
// src/db/index.js
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `MongoDB Connected! DB_HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    throw error;
  }
};
export default connectDB;
```

```js
// src/index.js
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
```

## multer file upload

```js
// src/middlewares/multer.middleware.js

import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // little tricky since multiple files of same name could be upload
    // but since these temp files will be upload for small time, this is alright
  },
});

export const upload = multer({ storage: storage });
```

## cloudinary file upload

```js
// src/utils/cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload file on cloudinary
    let response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    }); // (path, options)
    // file upload successfull
    console.log("file is uploading on cloudinary:", response.url);
    return response;
  } catch (error) {
    // remove the temporarily saved file from server if upload fails
    fs.unlinkSync(localFilePath); // unlink synchronously
    return null;
  }
};
```

## asyncHandler

```js
// basic async handler
function asyncHandler(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
}
```

```js
// src/utils/asyncHandler.js

// use either of the two below

// 1. try-catch asyncHandler
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. STANDARD asyncHandler
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
export { asyncHandler };
```

## error handling

```js
// src/utils/ApiError.js

export class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message); // overwrite parent constructor param with this one's message

    // create & set values
    this.statusCode = statusCode;
    this.data = null;
    // this.message = message; // not needed because super() already sets the message
    this.success = false;
    this.errors = errors;

    // *capture stack trace
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
```

## response handling

```js
// src/utils/ApiResponse.js

export class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
```

# Project Setup

## project structure

npm init

touch .gitignore .env .prettierrc .prettierignore

mkdir -p public/temp
touch public/temp/.gitkeep

mkdir src

cd src
touch app.js constants.js index.js
mkdir controller db middlewares models routes utils

cd ..
npm i -D nodemon prettier
npm i dotenv express mongoose cors cookie-parser
npm i mongoose-aggregate-paginate-v2 bcrypt jwt
npm i cloudinary multer

## project file changes

<details>
<summary><strong>package.json</strong></summary>

```json
{
  "type": "module", // can use cjs as well
  "scripts": {
    "dev": "nodemon src/index.js"
  }
}
```

</details>

<details>
<summary><strong>.prettierrc</strong></summary>

```json
{
  "singleQuote": false,
  "bracketSpacing": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "semi": true
}
```

</details>

<details>
<summary><strong>.prettierignore</strong></summary>

```
/.vscode
/node_modules
./dist

*.env
.env
.env.*
```

</details>

<details>
<summary><strong>.env</strong></summary>

```
PORT=3000
MONGODB_URI=mongodb+srv://prathamkathi:prathamkathi@cluster0.l5vofkz.mongodb.net # mongo atlas
CORS_ORIGIN=* # accept all origins

ACCESS_TOKEN_SECRET=3xVQpEo7jYJbT1smPHgKq2WR-vN8dZr4cU5LwFfBsaDM0t9Qe6yXiKhGCTpRJSuBv # use access token secret generator for this
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=CJ0X0-5aMdDNtowD9cvØoVIg9GG_0Gzh9zMocy03UtN1kBfLRn3Dmkx08MCFRSLHVTUkcyqgZAK7fdo
REFRESH_TOKEN_EXPIRY=10d # expiry more than access token secret

# cloudinary
CLOUDINARY_CLOUD_NAME=dnse1yvqq
CLOUDINARY_API_KEY=213764595352274
CLOUDINARY_API_SECRET=C18PmbpFIjvCOmbvIsHXTgs3Yt0
CLOUDINARY_URL=cloudinary://213764595352274:C18PmbpFIjvCOmbvIsHXTgs3Yt0@dnse1yvqq
```

</details>
