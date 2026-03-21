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

// Sign Up API with Local Storage
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

// Sign Up API with Cloudinary
userRouter.post(
  "/signUp",
  multer_cloudinary(multerEnum.image).single("profilePicture"),
  validation(userValidation.signUpSchema),
  userService.signUp,
);

// Sign Up with Gmail API
userRouter.post("/signup/gmail", userService.signUpWithGmail);

// Sign In API
userRouter.get(
  "/signIn",
  validation(userValidation.signInSchema),
  userService.signIn,
);

// Get Profile API
userRouter.get("/profile/", authentication, userService.getProfile);

// Refresh Token API
userRouter.get("/refreshToken", userService.refreshToken);

// Share Profile API
userRouter.get(
  "/shareProfile/:userId",
  validation(userValidation.shareProfileSchema),
  userService.shareProfile,
);

// Update Profile API
userRouter.patch(
  "/updateProfile",
  validation(userValidation.updateProfileSchema),
  authentication,
  userService.updateProfile,
);

// Update Password API
userRouter.patch(
  "/updatePassword",
  authentication,
  validation(userValidation.updatePasswordSchema),
  userService.updatePassword,
);

// Upload Profile Picture API
userRouter.patch(
  "/uploadProfilePicture",
  authentication,
  multer_cloudinary(multerEnum.image).single("profilePicture"),
  validation(userValidation.uploadProfilePictureSchema),
  userService.uploadProfilePicture,
);

// Remove Profile Picture API
userRouter.delete(
  "/removeProfilePicture",
  authentication,
  userService.removeProfilePicture,
);

// Log Out API
userRouter.post("/logOut", authentication, userService.logOut);

// Confirm Email API
userRouter.patch(
  "/confirmEmail",
  validation(userValidation.confirmEmailSchema),
  userService.confirmEmail,
);

// Resend OTP API
userRouter.post("/resendOTP", userService.resendOTP);

// Forget Password API
userRouter.post(
  "/forgetPassword",
  validation(userValidation.forgetPasswordSchema),
  userService.forgetPassword,
);

// Reset Password API
userRouter.patch(
  "/resetPassword",
  validation(userValidation.resetPasswordSchema),
  userService.resetPassword,
);

// Enable Two-Step Verification API
userRouter.post(
  "/twoStepVerification/enable",
  authentication,
  userService.enableTwoStepVerification,
);

// Verify Two-Step Verification API
userRouter.post(
  "/twoStepVerification/verify",
  authentication,
  validation(userValidation.verifyTwoStepSchema),
  userService.verifyEnableTwoStepVerification,
);

// Confirm Login with Two-Step Verification API
userRouter.post(
  "/signIn/confirm",
  validation(userValidation.confirmLoginTwoStepSchema),
  userService.confirmSignInTwoStep,
);


export default userRouter;
