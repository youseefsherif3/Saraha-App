import { Router } from "express";
import * as userService from "./user.service.js";
import { authentication } from "../../common/Middleware/authantication.js";
import { validation } from "../../common/Middleware/validate.js";
import { signInSchema, signUpSchema } from "./user.validation.js";

const userRouter = Router();

userRouter.post("/signUp", validation(signUpSchema), userService.signUp);

userRouter.post("/signup/gmail", userService.signUpWithGmail);

userRouter.get("/signIn", validation(signInSchema), userService.signIn);

userRouter.get("/profile/", authentication, userService.getProfile);

export default userRouter;
