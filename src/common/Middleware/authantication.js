import { verifyToken } from "../utils/token.service.js";
import * as DB_Services from "../../DB/DB.service.js";
import userModel from "../../DB/models/user.model.js";
import { TOKEN_SECRET_KEY } from "../../../config/config.service.js";
import { getMethod, revokedKey } from "../../DB/redis/redis.service.js";

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

  const user = await DB_Services.findOneService({
    model: userModel,
    filter: { _id: decoded.userId },
  });

  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }

  if (user?.changeCredential?.getTime() > decoded.iat * 1000) {
    throw new Error("token is expired", { cause: 401 });
  }

  const revokedToken = await getMethod(
    revokedKey({ userId: decoded.userId, jti: decoded.jti }),
  );

  if (revokedToken) {
    throw new Error("token is revoked", { cause: 401 });
  }

  req.user = user;

  req.decoded = decoded;

  next();
};
