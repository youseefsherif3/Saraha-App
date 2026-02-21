import { verifyToken } from "../utils/token.service.js";
import * as DB_Servises from "../../DB/DB.service.js";
import userModel from "../../DB/models/user.model.js";
import { TOKEN_SECRET_KEY } from "../../../config/config.service.js";

export const authentication = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new Error("authorization header is required", { cause: 401 });
  }

  const decoded = verifyToken({
    token: authorization,
    secret_key: TOKEN_SECRET_KEY,
  });

  if (!decoded || !decoded?.userId) {
    throw new Error("invalid token", { cause: 401 });
  }

  const user = await DB_Servises.findOneService({
    model: userModel,
    filter: { _id: decoded.userId },
    select: "-password",
  });

  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }

  req.user = user;

  next();
};
