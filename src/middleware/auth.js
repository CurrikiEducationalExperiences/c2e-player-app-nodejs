/* eslint-disable consistent-return */
const jwt = require("jsonwebtoken");
const ERROR_CODES = require("../constant/error-messages");
const CustomError = require("../utils/error");
const { Admin } = require("../../models/admins");
const { ResetPasswordTokens } = require("../../models/resetPasswordTokens");
const authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throw new CustomError(ERROR_CODES.AUTH_TOKEN_REQUIRED);
    }
    const tokens = req.headers.authorization.split(" ");
    if (
      tokens &&
      tokens.length > 0 &&
      tokens[0] === "Bearer" &&
      tokens[1] &&
      tokens[1] !== "null"
    ) {
      verify(tokens[1], (err, user) => {
        if (err) {
          return res
            .status(401)
            .send({ code: 401, message: err.message, result: null });
        }
        req.loggedUser = user;
        return next();
      });
    } else {
      return res
        .status(401)
        .send({ code: 401, message: "Authorization header is required" });
    }
  } catch (error) {
    console.log("error", "policy list error in authentication", {
      meta: { error: error.stack },
    });
    next(error);
  }
};

const issueToken = (payload) => {
  return jwt.sign(payload, "somesecret", {
    expiresIn: `24h`,
  });
};

const issueResetPassToken = (payload) => {
  return jwt.sign(payload, "someresetpasswordsecret", {
    expiresIn: `30m`,
  });
};

const validatePasswordToken = (token) => {
  if (!token) {
    return 404;
  }
  try {
    const _decoded = jwt.verify(token, 'someresetpasswordsecret');
    return _decoded;
  }
  catch (err) {
    return 404
  }
}


const verify = async (token, done) => {
  jwt.verify(token, "somesecret", {}, async (err, decoded) => {
    if (err) {
      switch (err.message) {
        case "jwt expired":
          return done(ERROR_CODES.AUTH_TOKEN_EXPIRED);
        case "invalid token":
          return done(ERROR_CODES.AUTH_TOKEN_INVALID);
        default:
          return done(ERROR_CODES.AUTH_TOKEN_INVALID);
      }
    } else {
      const user = await Admin.findOne( { where: {id: decoded.id}, raw: true});
      return user && user.id
        ? done(null, user)
        : done(ERROR_CODES.AUTH_TOKEN_EXPIRED);
    }
  });
};

module.exports = {
  authMiddleware,
  issueToken,
  issueResetPassToken,
  validatePasswordToken,
};
