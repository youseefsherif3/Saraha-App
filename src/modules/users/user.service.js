import { providerEnum } from "../../common/enum/user.enum.js";
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
  block_OTP_Key,
  checkTTLMethod,
  deleteMethod,
  getKey,
  getMethod,
  incrMethod,
  keys,
  max_OTP_Key,
  OTP_Key,
  reset_Password_OTP_Key,
  two_Step_Enable_OTP_Key,
  two_Step_Login_OTP_Key,
  two_Step_Login_Pending_Key,
  revokedKey,
  setMethod,
} from "../../DB/redis/redis.service.js";
import { generateOTP, sendEmail } from "../../common/utils/email/send.email.js";

// Sign Up API
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

  const OTP = await generateOTP();

  await sendEmail({
    to: email,
    subject: "Welcome to Saraha App",
    html: `<h1>Welcome to Saraha App</h1><p>Dear ${userName} Your OTP Is : ${OTP} ,</p><p>Thank you for signing up for Saraha App! We're excited to have you on board.</p><p>Best regards,<br>Saraha App Team</p>`,
  });

  await setMethod({
    key: OTP_Key({ email }),
    value: hashing({ plaintext: `${OTP}` }),
    ttl: 60 * 2,
  });

  await setMethod({
    key: max_OTP_Key({ email }),
    value: 1,
    ttl: 60,
  });

  res.status(201).json({
    message: "user created successfully",
    user,
  });
};

// Sign Up with Gmail API
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

// Sign In API
export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await DB_Services.findOneService({
    model: userModel,
    filter: {
      email,
      provider: providerEnum.system,
      confirmed: { $exists: true },
    },
  });

  if (!user) {
    throw new Error("user not found, Check your email or sign up", {
      cause: 404,
    });
  }

  if (user.confirmed === false) {
    throw new Error("please confirm your email before signing in", {
      cause: 400,
    });
  }

  if (!compareHashing({ plaintext: password, cipherText: user.password })) {
    throw new Error("invalid password, Check your password or sign up", {
      cause: 401,
    });
  }

  if (user.twoStepVerification) {
    const twoStepOtpKey = two_Step_Login_OTP_Key({ email: user.email });
    const pendingKey = two_Step_Login_Pending_Key({ email: user.email });
    const ttl = await checkTTLMethod(twoStepOtpKey);

    if (ttl > 0) {
      throw new Error(
        `verification code already sent, please wait ${ttl} seconds before requesting a new one`,
        { cause: 400 },
      );
    }

    const otp = await generateOTP();

    await sendEmail({
      to: user.email,
      subject: "Login Verification - Saraha App",
      html: `<h1>Login Verification</h1><p>Dear ${user.userName}, your login OTP is: ${otp}</p><p>This OTP will expire in 5 minutes.</p>`,
    });

    await setMethod({
      key: twoStepOtpKey,
      value: hashing({ plaintext: `${otp}` }),
      ttl: 60 * 5,
    });

    await setMethod({
      key: pendingKey,
      value: {
        userId: user._id,
      },
      ttl: 60 * 5,
    });

    return res.status(200).json({
      message: "login verification code sent successfully",
      requireTwoStepVerification: true,
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

// Confirm Login with Two-Step Verification API
export const confirmSignInTwoStep = async (req, res, next) => {
  const { email, otp } = req.body;

  const twoStepOtpKey = two_Step_Login_OTP_Key({ email });
  const pendingKey = two_Step_Login_Pending_Key({ email });

  const pendingLogin = await getMethod(pendingKey);
  const storedOtp = await getMethod(twoStepOtpKey);

  if (!pendingLogin || !storedOtp) {
    throw new Error(
      "login verification expired, please sign in again to receive a new code",
      { cause: 400 },
    );
  }

  if (!compareHashing({ plaintext: otp, cipherText: storedOtp })) {
    throw new Error("invalid verification code", { cause: 400 });
  }

  const user = await DB_Services.findOneService({
    model: userModel,
    filter: {
      _id: pendingLogin.userId,
      email,
      provider: providerEnum.system,
    },
  });

  if (!user) {
    throw new Error("user not found", { cause: 404 });
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

  await deleteMethod(twoStepOtpKey);
  await deleteMethod(pendingKey);

  res.status(200).json({
    message: "user signed in successfully",
    token,
    refreshToken,
  });
};

// Get Profile API
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

// Refresh Token API
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

// Share Profile API
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

// Update Profile API
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

// Update Password API
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

// Upload Profile Picture API
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

// Remove Profile Picture API
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

// Log Out API
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

// Confirm Email API
export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;

  const otpExists = await getMethod(OTP_Key({ email }));

  if (!otpExists) {
    throw new Error("OTP expired, please request a new one", { cause: 400 });
  }

  if (!compareHashing({ plaintext: otp, cipherText: otpExists })) {
    throw new Error("invalid OTP", { cause: 400 });
  }

  const user = await DB_Services.findOneAndUpdateService({
    model: userModel,
    filter: {
      email,
      confirmed: { $exists: false },
      provider: providerEnum.system,
    },
    update: { confirmed: true },
  });

  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }

  if (user.confirmed) {
    throw new Error("email already confirmed", { cause: 400 });
  }

  await deleteMethod(OTP_Key({ email }));

  res.status(200).json({
    message: "email confirmed successfully",
    user,
  });
};

// Resend OTP API
export const resendOTP = async (req, res, next) => {
  const { email } = req.body;

  const user = await DB_Services.findOneService({
    model: userModel,
    filter: {
      email,
      confirmed: { $exists: false },
      provider: providerEnum.system,
    },
  });

  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }

  if (user.confirmed) {
    throw new Error("email already confirmed", { cause: 400 });
  }

  const isBlocked = await checkTTLMethod(block_OTP_Key({ email }));

  if (isBlocked > 0) {
    throw new Error(
      `you have reached the maximum number of OTP requests and are blocked, please try again after ${isBlocked} seconds`,
      { cause: 400 },
    );
  }

  const ttl = await checkTTLMethod(OTP_Key({ email }));

  if (ttl > 0) {
    throw new Error(
      `OTP already sent, please wait ${ttl} seconds before requesting a new one`,
      { cause: 400 },
    );
  }

  const max_otp = await getMethod(max_OTP_Key({ email }));

  if (max_otp >= 3) {
    await setMethod({
      key: block_OTP_Key({ email }),
      value: 1,
      ttl: 60 * 30,
    });

    throw new Error(
      "you have reached the maximum number of OTP requests, please try again later",
      { cause: 400 },
    );
  }

  const OTP = await generateOTP();

  await sendEmail({
    to: user.email,
    subject: "Welcome to Saraha App",
    html: `<h1>Welcome to Saraha App</h1><p>Dear ${user.userName} Your OTP Is : ${OTP} ,</p><p>Thank you for signing up for Saraha App! We're excited to have you on board.</p><p>Best regards,<br>Saraha App Team</p>`,
  });

  await setMethod({
    key: OTP_Key({ email }),
    value: hashing({ plaintext: `${OTP}` }),
    ttl: 60 * 2,
  });

  await incrMethod(max_OTP_Key({ email }));

  res.status(200).json({
    message: "email confirmed successfully",
    user,
  });
};

// Forget Password API
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await DB_Services.findOneService({
    model: userModel,
    filter: {
      email,
      provider: providerEnum.system,
    },
  });

  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }

  const resetOTPKey = reset_Password_OTP_Key({ email });
  const ttl = await checkTTLMethod(resetOTPKey);

  if (ttl > 0) {
    throw new Error(
      `OTP already sent, please wait ${ttl} seconds before requesting a new one`,
      { cause: 400 },
    );
  }

  const OTP = await generateOTP();

  await sendEmail({
    to: user.email,
    subject: "Reset Password - Saraha App",
    html: `<h1>Reset Password</h1><p>Dear ${user.userName}, your reset OTP is: ${OTP}</p><p>This OTP will expire in 10 minutes.</p>`,
  });

  await setMethod({
    key: resetOTPKey,
    value: hashing({ plaintext: `${OTP}` }),
    ttl: 60 * 10,
  });

  res.status(200).json({
    message: "password reset OTP sent successfully",
  });
};

// Reset Password API
export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    throw new Error("new password and confirm new password do not match", {
      cause: 400,
    });
  }

  const user = await DB_Services.findOneService({
    model: userModel,
    filter: {
      email,
      provider: providerEnum.system,
    },
  });

  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }

  const resetOTPKey = reset_Password_OTP_Key({ email });
  const storedOtp = await getMethod(resetOTPKey);

  if (!storedOtp) {
    throw new Error("OTP expired, please request a new one", { cause: 400 });
  }

  if (!compareHashing({ plaintext: otp, cipherText: storedOtp })) {
    throw new Error("invalid OTP", { cause: 400 });
  }

  await DB_Services.findOneAndUpdateService({
    model: userModel,
    filter: { _id: user._id },
    update: {
      password: hashing({ plaintext: newPassword, salt_rounds: SALT_ROUNDS }),
      changeCredential: new Date(),
    },
  });

  await deleteMethod(resetOTPKey);

  res.status(200).json({
    message: "password reset successfully",
  });
};

// Enable Two-Step Verification API
export const enableTwoStepVerification = async (req, res, next) => {
  const user = req.user;

  if (user.twoStepVerification) {
    throw new Error("two-step verification is already enabled", {
      cause: 400,
    });
  }

  const otpKey = two_Step_Enable_OTP_Key({ email: user.email });
  const ttl = await checkTTLMethod(otpKey);

  if (ttl > 0) {
    throw new Error(
      `verification code already sent, please wait ${ttl} seconds before requesting a new one`,
      { cause: 400 },
    );
  }

  const otp = await generateOTP();

  await sendEmail({
    to: user.email,
    subject: "Enable Two-Step Verification - Saraha App",
    html: `<h1>Two-Step Verification</h1><p>Dear ${user.userName}, your verification OTP is: ${otp}</p><p>This OTP will expire in 5 minutes.</p>`,
  });

  await setMethod({
    key: otpKey,
    value: hashing({ plaintext: `${otp}` }),
    ttl: 60 * 5,
  });

  res.status(200).json({
    message: "verification code sent successfully",
  });
};

// Verify Two-Step Verification API
export const verifyEnableTwoStepVerification = async (req, res, next) => {
  const { otp } = req.body;
  const user = req.user;

  if (user.twoStepVerification) {
    throw new Error("two-step verification is already enabled", {
      cause: 400,
    });
  }

  const otpKey = two_Step_Enable_OTP_Key({ email: user.email });
  const storedOtp = await getMethod(otpKey);

  if (!storedOtp) {
    throw new Error("verification code expired, please request a new one", {
      cause: 400,
    });
  }

  if (!compareHashing({ plaintext: otp, cipherText: storedOtp })) {
    throw new Error("invalid verification code", { cause: 400 });
  }

  await DB_Services.findOneAndUpdateService({
    model: userModel,
    filter: { _id: user._id },
    update: { twoStepVerification: true },
  });

  await deleteMethod(otpKey);

  res.status(200).json({
    message: "two-step verification enabled successfully",
  });
};
