import { Router } from "express";
import * as messageService from "./message.service.js";
import * as messageValidation from "./message.validation.js";
import { multer_local } from "../../common/Middleware/multer.js";
import { validation } from "../../common/Middleware/validate.js";
import { multerEnum } from "../../common/enum/multer.enum.js";
import { authentication } from "../../common/Middleware/authantication.js";

const messageRouter = Router({
  caseSensitive: true,
  strict: true,
  mergeParams: true,
});

messageRouter.post(
  "/send",
  // multer_local({
  //   customPath: "messages",
  //   customType: multerEnum.image,
  // }).array("attachment", 3),
  validation(messageValidation.sendMessageSchema),
  messageService.sendMessage,
);

messageRouter.get(
  "/:messageId",
  authentication,
  validation(messageValidation.getMessageSchema),
  messageService.getMessage,
);

messageRouter.get("/", authentication, messageService.getAllMessages);

export default messageRouter;
