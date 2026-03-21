import Joi from "joi";
import { genderEnum } from "../../common/enum/user.enum.js";
import { generalRules } from "../../common/utils/generalRules.js";

// Sign Up Schema
export const signUpSchema = {
  body: Joi.object({
    userName: Joi.string().min(5).max(20).required(),
    email: generalRules.email.required(),
    password: generalRules.password.required(),
    confirmPassword: generalRules.confirmPassword.required(),
    gender: Joi.string().valid(genderEnum.male, genderEnum.female).required(),
    age: Joi.number().integer().min(18).max(80).required(),
  }).required(),

  file: generalRules.file.required(),

  // files: Joi.array()
  //   .max(2)
  //   .items(generalRules.file.required())
  //   .required()
  //   .messages({
  //     "any.required": "cover Picture is required",
  //   }),

  // files: Joi.object({
  //   profilePicture: Joi.array()
  //     .max(1)
  //     .items(generalRules.file.required())
  //     .required(),
  //   coverPicture: Joi.array()
  //     .max(5)
  //     .items(generalRules.file.required())
  //     .required(),
  // }).required(),
};

// Sign In Schema
export const signInSchema = {
  body: Joi.object({
    email: Joi.string().lowercase().email().required(),
    password: Joi.string()
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
      .required(),
  }).required(),

  //   query: Joi.object({
  //     name: Joi.string().required(),
  //   }).required(),
};

// Share Profile Schema
export const shareProfileSchema = {
  params: Joi.object({
    userId: generalRules.userId.required(),
  }).required(),
};

// Update Profile Schema
export const updateProfileSchema = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(20),
    lastName: Joi.string().min(2).max(20),
    age: Joi.number().integer().min(18).max(80),
    gender: Joi.string().valid(genderEnum.male, genderEnum.female),
  }).required(),
};

// Update Password Schema
export const updatePasswordSchema = {
  body: Joi.object({
    currentPassword: generalRules.password.required(),
    newPassword: generalRules.password.required(),
    confirmNewPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }).required(),
};

// Upload Profile Picture Schema
export const uploadProfilePictureSchema = {
  file: generalRules.file.required(),
};

// Confirm Email Schema
export const confirmEmailSchema = {
  body: Joi.object({
    email: generalRules.email.required(),
    otp: Joi.string()
      .regex(/^[0-9]{6}$/)
      .required()
      .messages({
        "string.pattern.base": "OTP must be a 6-digit number",
      }),
  }).required(),
};

// Forget Password Schema
export const forgetPasswordSchema = {
  body: Joi.object({
    email: generalRules.email.required(),
  }).required(),
};

// Reset Password Schema
export const resetPasswordSchema = {
  body: Joi.object({
    email: generalRules.email.required(),
    otp: Joi.string()
      .regex(/^[0-9]{6}$/)
      .required()
      .messages({
        "string.pattern.base": "OTP must be a 6-digit number",
      }),
    newPassword: generalRules.password.required(),
    confirmNewPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }).required(),
};

// Enable Two-Step Verification Schema
export const verifyTwoStepSchema = {
  body: Joi.object({
    otp: Joi.string()
      .regex(/^[0-9]{6}$/)
      .required()
      .messages({
        "string.pattern.base": "OTP must be a 6-digit number",
      }),
  }).required(),
};

// Confirm Login Two-Step Verification Schema
export const confirmLoginTwoStepSchema = {
  body: Joi.object({
    email: generalRules.email.required(),
    otp: Joi.string()
      .regex(/^[0-9]{6}$/)
      .required()
      .messages({
        "string.pattern.base": "OTP must be a 6-digit number",
      }),
  }).required(),
};
