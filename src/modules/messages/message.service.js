import * as DB_service from "../../DB/DB.service.js";
import messageModel from "../../DB/models/message.model.js";
import userModel from "../../DB/models/user.model.js";

export const sendMessage = async (req, res, next) => {
  const { content, userId } = req.body;

  const user = await DB_service.findByIdService({
    model: userModel,
    id: userId,
  });

  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }

  const arr = (req.files || []).map((file) => file.path);

  const message = await DB_service.createService({
    model: messageModel,
    data: {
      content,
      userId,
      attachment: arr,
    },
  });

  res.status(201).json({
    message: "message sent successfully",
    data: message,
  });
};

export const getMessage = async (req, res, next) => {
  const { messageId } = req.params;

  const message = await DB_service.findOneService({
    model: messageModel,
    filter: { _id: messageId, userId: req.user._id },
  });

  if (!message) {
    throw new Error("message not found", { cause: 404 });
  }

  res.status(200).json({
    message: "message retrieved successfully",
    data: message,
  });
};

export const getAllMessages = async (req, res, next) => {
  const messages = await DB_service.findService({
    model: messageModel,
    filter: { userId: req.params.userId },
  });

  res.status(200).json({
    message: "messages retrieved successfully",
    data: messages,
  });
};
