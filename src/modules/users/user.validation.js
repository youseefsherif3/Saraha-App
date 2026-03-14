import Joi from "joi";
import { genderEnum } from "../../common/enum/user.enum.js";
import { generalRules } from "../../common/utils/generalRules.js";

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

export const shareProfileSchema = {
  params: Joi.object({
    userId: generalRules.userId.required(),
  }).required(),
};

export const updateProfileSchema = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(20),
    lastName: Joi.string().min(2).max(20),
    age: Joi.number().integer().min(18).max(80),
    gender: Joi.string().valid(genderEnum.male, genderEnum.female),
  }).required(),
};

export const updatePasswordSchema = {
  body: Joi.object({
    currentPassword: generalRules.password.required(),
    newPassword: generalRules.password.required(),
    confirmNewPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }).required(),
};

export const uploadProfilePictureSchema = {
  file: generalRules.file.required(),
};
