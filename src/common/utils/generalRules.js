import Joi from "joi";
import mongoose, { Types } from "mongoose";

const customId = (v, h) => {
  const isValid = mongoose.Types.ObjectId.isValid(v);
  return isValid ? v : h.message("invalid id");
};

export const generalRules = {
  email: Joi.string().lowercase().email(),
  password: Joi.string().regex(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
  ),
  confirmPassword: Joi.string().valid(Joi.ref("password")),
  userId: Joi.string().custom((value, helper) => {
    const isValid = Types.ObjectId.isValid(value);
    return isValid ? value : helper.message("invalid user id");
  }),

  id: Joi.string().custom(customId),

  file: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    size: Joi.number().required(),
  })
    .required()
    .messages({
      "any.required": "profile Picture is required",
    }),
};
