import express from "express";
import checkConnectionDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors";
import { PORT, WHITELIST } from "../config/config.service.js";
import { redisConnection } from "./DB/redis/redis.db.js";
import messageRouter from "./modules/messages/message.controller.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

const app = express();
const port = PORT;

const bootstrap = async () => {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  });

  const corsOptions = {
    origin: function (origin, callback) {
      if ([...WHITELIST, undefined].includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  };

  app.use(cors(corsOptions), helmet(), limiter, express.json());

  app.get("/", (req, res, next) => {
    res.status(200).json({ message: "Welcome to saraha app!" });
  });

  checkConnectionDB();

  redisConnection();

  app.use("/uploads", express.static("uploads"));

  app.use("/users", userRouter);

  app.use("/messages", messageRouter);

  app.use("{/*demo}", (req, res, next) => {
    throw new Error(`URL ${req.originalUrl} Not Valid !! Enter a valid URL`, {
      cause: 404,
    });
  });

  app.use((err, req, res, next) => {
    res.status(err.cause || 500).json({
      message: err.message,
      stack: err.stack,
    });
  });

  app.listen(port, () => {
    console.log(`Saraha app listening on port ${port}!`);
  });
};

export default bootstrap;
