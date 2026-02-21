import dotenv from "dotenv";
import e from "express";
import { resolve } from "path";
dotenv.config({ path: resolve("config/.env") });

export const PORT = +process.env.PORT;

export const SALT_ROUNDS = +process.env.SALT_ROUNDS;

export const MONGO_URL = process.env.MONGO_URL;

export const TOKEN_SECRET_KEY = process.env.TOKEN_SECRET_KEY;

