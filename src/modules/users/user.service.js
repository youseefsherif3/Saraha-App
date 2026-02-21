import { skipMiddlewareFunction } from "mongoose";
import { providerEnum } from "../../common/enum/user.enum.js";
import {
  decrypt,
  encrypt,
} from "../../common/utils/secuirty/encrypt.security.js";
import {
  compareHashing,
  hashing,
} from "../../common/utils/secuirty/hash.security.js";
import {
  generateToken,
  verifyToken,
} from "../../common/utils/token.service.js";
import * as DB_Servises from "../../DB/DB.service.js";
import userModel from "../../DB/models/user.model.js";
import { hashSync, compareSync } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";
import {
  SALT_ROUNDS,
  TOKEN_SECRET_KEY,
} from "../../../config/config.service.js";

export const signUp = async (req, res, next) => {
  const { userName, email, password, confirmPassword, age, gender } = req.body;

  if (userName.split(" ").length < 2) {
    throw new Error("userName must contain first name and last name", {
      cause: 400,
    });
  }

  if (password !== confirmPassword) {
    throw new Error("password and confirm password do not match", {
      cause: 400,
    });
  }

  if (
    await DB_Servises.findOneService({ model: userModel, filter: { email } })
  ) {
    throw new Error("email already exists", { cause: 409 });
  }

  const user = await DB_Servises.createService({
    model: userModel,
    data: {
      userName,
      email,
      password: hashing({ plaintext: password, salt_rounds: SALT_ROUNDS }),
      age,
      gender,
    },
  });

  res.status(201).json({
    message: "user created successfully",
    user,
  });
};

export const signUpWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience:
      "1081002871528-ccg79i162psg7ke7kpldnirvvfb880h6.apps.googleusercontent.com",
  });

  const payload = ticket.getPayload();

  const { email, email_verified, name, picture } = payload;

  let user = await DB_Servises.findOneService({
    model: userModel,
    filter: { email },
  });

  if (!user) {
    user = await DB_Servises.createService({
      model: userModel,
      data: {
        userName: name,
        email,
        profilePicture: picture,
        provider: providerEnum.google,
        confirmed: email_verified,
      },
    });
  }

  if (user.provider == providerEnum.system) {
    throw new Error(
      "email already exists with another provider, please sign in with your email and password or use another email",
      { cause: 409 },
    );
  }

  const token = generateToken({
    payload: { userId: user._id, email: user.email },
    secret_key: TOKEN_SECRET_KEY,
    options: {
      expiresIn: "1h",
    },
  });

  res.status(200).json({
    message: "user signed in successfully",
    token,
  });
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await DB_Servises.findOneService({
    model: userModel,
    filter: { email, provider: providerEnum.system },
  });

  if (!user) {
    throw new Error("user not found, Check your email or sign up", {
      cause: 404,
    });
  }

  if (!compareHashing({ plaintext: password, cipherText: user.password })) {
    throw new Error("invalid password, Check your password or sign up", {
      cause: 401,
    });
  }

  const token = generateToken({
    payload: { userId: user._id, email: user.email },
    secret_key: TOKEN_SECRET_KEY,
    options: {
      expiresIn: "1h",
      jwtid: uuidv4(),
    },
  });

  res.status(200).json({
    message: "user signed in successfully",
    token,
  });
};

export const getProfile = async (req, res, next) => {
  res.status(200).json({
    message: "user profile retrieved successfully",
    user: req.user,
  });
};
