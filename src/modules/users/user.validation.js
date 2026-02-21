import Joi from "joi";
import { genderEnum } from "../../common/enum/user.enum.js";

export const signUpSchema = {
  body: Joi.object({
    userName: Joi.string().min(5).max(20).required(),
    email: Joi.string().lowercase().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    gender: Joi.string().valid(genderEnum.male, genderEnum.female).required(),
    age: Joi.number().integer().min(18).max(80).required(),
  }).required(),
};

export const signInSchema = {
  body: Joi.object({
    email: Joi.string().lowercase().email().required(),
    password: Joi.string().min(6).required(),
  }).required(),

//   query: Joi.object({
//     name: Joi.string().required(),
//   }).required(),
};
