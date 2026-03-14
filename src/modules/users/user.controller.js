import { Router } from "express";
import * as userService from "./user.service.js";
import { authentication } from "../../common/Middleware/authantication.js";
import { validation } from "../../common/Middleware/validate.js";
import * as userValidation from "./user.validation.js";
import {
  multer_cloudinary,
  multer_local,
} from "../../common/Middleware/multer.js";
import { multerEnum } from "../../common/enum/multer.enum.js";

const userRouter = Router();

// userRouter.post(
//   "/signUp",
//   /*validation(userValidation.signUpSchema)*/ multer_local({
//     customPath: "users",
//     customType: [...multerEnum.image],
//   }).fields([
//     {
//       name: "profilePicture",
//       maxCount: 1,
//     },
//     {
//       name: "coverPicture",
//       maxCount: 5,
//     },
//   ]),
//   userService.signUp,
// );

userRouter.post(
  "/signUp",
  multer_cloudinary(multerEnum.image).single("profilePicture"),
  validation(userValidation.signUpSchema),
  userService.signUp,
);

userRouter.post("/signup/gmail", userService.signUpWithGmail);

userRouter.get(
  "/signIn",
  validation(userValidation.signInSchema),
  userService.signIn,
);

userRouter.get("/profile/", authentication, userService.getProfile);

userRouter.get("/refreshToken", userService.refreshToken);

userRouter.get(
  "/shareProfile/:userId",
  validation(userValidation.shareProfileSchema),
  userService.shareProfile,
);

userRouter.patch(
  "/updateProfile",
  validation(userValidation.updateProfileSchema),
  authentication,
  userService.updateProfile,
);

userRouter.patch(
  "/updatePassword",
  authentication,
  validation(userValidation.updatePasswordSchema),
  userService.updatePassword,
);

userRouter.patch(
  "/uploadProfilePicture",
  authentication,
  multer_cloudinary(multerEnum.image).single("profilePicture"),
  validation(userValidation.uploadProfilePictureSchema),
  userService.uploadProfilePicture,
);

userRouter.delete(
  "/removeProfilePicture",
  authentication,
  userService.removeProfilePicture,
);

userRouter.post("/logOut", authentication, userService.logOut);

export default userRouter;
