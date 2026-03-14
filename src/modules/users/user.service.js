import { set, skipMiddlewareFunction } from "mongoose";
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
import * as DB_Services from "../../DB/DB.service.js";
import userModel from "../../DB/models/user.model.js";
import { hashSync, compareSync } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";
import { randomUUID } from "crypto";
import {
  REFRESH_TOKEN_SECRET_KEY,
  SALT_ROUNDS,
  TOKEN_SECRET_KEY,
} from "../../../config/config.service.js";
import cloudinary from "../../common/utils/cloudinary.js";
import revokeTokenModel from "../../DB/models/revokeToken.model.js";
import { flagEnum } from "../../common/enum/flag.enum.js";
import {
  deleteMethod,
  getKey,
  getMethod,
  keys,
  revokedKey,
  setMethod,
} from "../../DB/redis/redis.service.js";

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
    await DB_Services.findOneService({ model: userModel, filter: { email } })
  ) {
    throw new Error("email already exists", { cause: 409 });
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
  );

  // let arr_paths = [];

  // for (const file of req.files.coverPicture) {
  //   arr_paths.push(file.path);
  // }

  const user = await DB_Services.createService({
    model: userModel,
    data: {
      userName,
      email,
      password: hashing({ plaintext: password, salt_rounds: SALT_ROUNDS }),
      age,
      gender,
      profilePicture: { secure_url, public_id },
      // coverPicture: arr_paths,
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

  let user = await DB_Services.findOneService({
    model: userModel,
    filter: { email },
  });

  if (!user) {
    user = await DB_Services.createService({
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

  const user = await DB_Services.findOneService({
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

  const jwtid = randomUUID();

  const token = generateToken({
    payload: { userId: user._id, email: user.email },
    secret_key: TOKEN_SECRET_KEY,
    options: {
      expiresIn: "1h",
      jwtid,
    },
  });

  const refreshToken = generateToken({
    payload: { userId: user._id, email: user.email },
    secret_key: REFRESH_TOKEN_SECRET_KEY,
    options: {
      expiresIn: "1y",
      jwtid,
    },
  });

  res.status(200).json({
    message: "user signed in successfully",
    token,
    refreshToken,
  });
};

export const getProfile = async (req, res, next) => {
  const key = `profile::${req.user._id}`;

  const userExists = await getMethod(key);

  if (userExists) {
    return res.status(200).json({
      message: "user profile retrieved successfully",
      user: userExists,
    });
  }

  await setMethod({
    key,
    value: req.user,
    ttl: 60,
  });

  res.status(200).json({
    message: "user profile retrieved successfully",
    user: req.user,
  });
};

export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new Error("authorization header is required", { cause: 401 });
  }

  const decoded = verifyToken({
    token: authorization,
    secret_key: REFRESH_TOKEN_SECRET_KEY,
  });

  if (!decoded || !decoded?.userId) {
    throw new Error("invalid token", { cause: 401 });
  }

  const user = await DB_Services.findOneService({
    model: userModel,
    filter: { _id: decoded.userId },
    select: "-password",
  });

  const revokedToken = await DB_Services.findOneService({
    model: revokeTokenModel,
    filter: { tokenId: decoded.jti },
  });

  if (revokedToken) {
    throw new Error("token is revoked", { cause: 401 });
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
    message: "token refreshed successfully",
    token,
    user,
  });
};

export const shareProfile = async (req, res, next) => {
  const { userId } = req.params;

  const user = await DB_Services.findOneService({
    model: userModel,
    filter: { _id: userId },
    select: "-password -provider -createdAt -updatedAt -__v  -role",
  });

  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }

  res.status(200).json({
    message: "user profile retrieved successfully",
    user,
  });
  7;
};

export const updateProfile = async (req, res, next) => {
  const { firstName, lastName, gender, age } = req.body;

  const user = await DB_Services.findOneAndUpdateService({
    model: userModel,
    filter: { _id: req.user._id },
    update: { firstName, lastName, gender, age },
  });

  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }

  await deleteMethod(`profile::${req.user._id}`);

  res.status(200).json({
    message: "user profile updated successfully",
    user,
  });
};

export const updatePassword = async (req, res, next) => {
  let { currentPassword, newPassword } = req.body;

  if (
    !compareHashing({
      plaintext: currentPassword,
      cipherText: req.user.password,
    })
  ) {
    throw new Error("invalid current password", { cause: 401 });
  }

  const hashedPassword = hashing({ plaintext: newPassword });

  req.user.password = hashedPassword;

  await req.user.save();

  res.status(200).json({
    message: "password updated successfully",
  });
};

export const uploadProfilePicture = async (req, res, next) => {
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
  );

  req.user.profilePicture = { secure_url, public_id };

  await req.user.save();

  await deleteMethod(`profile::${req.user._id}`);

  res.status(200).json({
    message: "profile picture uploaded successfully",
  });
};

export const removeProfilePicture = async (req, res, next) => {
  if (!req.user.profilePicture?.public_id) {
    throw new Error("profile picture not found", { cause: 404 });
  }

  await cloudinary.uploader.destroy(req.user.profilePicture.public_id);

  req.user.profilePicture = undefined;

  await req.user.save();

  await deleteMethod(`profile::${req.user._id}`);

  res.status(200).json({
    message: "profile picture removed successfully",
  });
};

export const logOut = async (req, res, next) => {
  const { flag } = req.query;

  if (flag == flagEnum.allDevices) {
    req.user.changeCredential = new Date();

    await req.user.save();

    await deleteMethod(await keys(getKey({ userId: req.user._id })));

    // await DB_Services.deleteManyService({
    //   model: revokeTokenModel,
    //   filter: { userId: req.user._id },
    // });
  } else {
    await setMethod({
      key: revokedKey({ userId: req.user._id, jti: req.decoded.jti }),
      value: `${req.decoded.jti}`,
      ttl: req.decoded.exp - Math.floor(Date.now() / 1000),
    });

    // await DB_Services.createService({
    //   model: revokeTokenModel,
    //   data: {
    //     tokenId: req.decoded.jti,
    //     userId: req.user._id,
    //     expireAt: new Date(req.decoded.exp * 1000),
    //   },
    // });
  }

  req.user.changeCredential = new Date();

  await req.user.save();

  res.status(200).json({
    message: "logged out successfully",
  });
};
