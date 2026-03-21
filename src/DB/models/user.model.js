import mongoose from "mongoose";
import {
  genderEnum,
  providerEnum,
  roleEnum,
} from "../../common/enum/user.enum.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLenght: 3,
      maxLenght: 20,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minLenght: 3,
      maxLenght: 20,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider == providerEnum.system ? true : false;
      },
      minLenght: 6,
      trim: true,
    },
    gender: {
      type: String,
      // required: true,
      enum: Object.values(genderEnum),
      default: genderEnum.male,
    },
    age: {
      type: Number,
      // required: true,
    },
    role: {
      type: String,
      enum: Object.values(roleEnum),
      default: roleEnum.user,
    },
    profilePicture: {
      secure_url: { type: String },
      public_id: { type: String },
    },
    coverPicture: [
      {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    changeCredential : Date,
    twoStepVerification: {
      type: Boolean,
      default: false,
    },
    confirmed: Boolean,
    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.system,
    },
  },
  { timestamps: true, strictQuery: true, toJSON: { virtuals: true } },
);

userSchema
  .virtual("userName")
  .get(function () {
    return this.firstName + " " + this.lastName;
  })
  .set(function (name) {
    const [firstName, lastName] = name.split(" ");
    this.set({ firstName, lastName });
  });

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
