import { Router } from "express";
import * as userService from "./user.service.js";
import { authentication } from "../../common/Middleware/authantication.js";
import { validation } from "../../common/Middleware/validate.js";
import * as userValidation from "./user.validation.js";
import { multer_cloudinary } from "../../common/Middleware/multer.js";
import { multerEnum } from "../../common/enum/multer.enum.js";
import messageRouter from "../messages/message.controller.js";

const userRouter = Router({ caseSensitive: true, strict: true });

userRouter.use("/:userId/messages", messageRouter);

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

userRouter.patch(
  "/confirmEmail",
  validation(userValidation.confirmEmailSchema),
  userService.confirmEmail,
);

userRouter.post("/resendOTP", userService.resendOTP);

userRouter.post(
  "/forgetPassword",
  validation(userValidation.forgetPasswordSchema),
  userService.forgetPassword,
);

userRouter.patch(
  "/resetPassword",
  validation(userValidation.resetPasswordSchema),
  userService.resetPassword,
);

userRouter.post(
  "/twoStepVerification/enable",
  authentication,
  userService.enableTwoStepVerification,
);

userRouter.post(
  "/twoStepVerification/verify",
  authentication,
  validation(userValidation.verifyTwoStepSchema),
  userService.verifyEnableTwoStepVerification,
);

userRouter.post(
  "/signIn/confirm",
  validation(userValidation.confirmLoginTwoStepSchema),
  userService.confirmSignInTwoStep,
);

export default userRouter;
