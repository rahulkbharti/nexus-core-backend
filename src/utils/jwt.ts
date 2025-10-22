import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
// dotenv.config({ path: process.env.ENV_FILE || ".env.development" });

const accessTokenSecret = process.env.JWT_ACCESS_SECRET || "s";
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || "r";

// const accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
const accessTokenExpiresIn = "1d";
const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export const createAccessToken = (payload: {
  userId: number;
  email: string;
  permissions: string[];
  role: string;
  organizationId: number;
  permissions_updated_at: number;
}): string => {
  if (!accessTokenSecret || !accessTokenExpiresIn) {
    console.error(
      "JWT secret or access token expiration time is not defined in environment variables."
    );
    throw new Error("Server configuration error: JWT settings are missing.");
  }
  const signOptions: SignOptions = {
    expiresIn: accessTokenExpiresIn as SignOptions["expiresIn"],
    algorithm: "HS256",
  };
  return jwt.sign({ ...payload }, accessTokenSecret, signOptions);
};

export const createRefreshToken = (payload: {
  userId: number;
  email: string;
  permissions: string[];
  role: string;
  organizationId: number;
  permissions_updated_at: number;
}): string => {
  if (!refreshTokenSecret || !refreshTokenExpiresIn) {
    console.error(
      "JWT secret or refresh token expiration time is not defined in environment variables."
    );
    throw new Error("Server configuration error: JWT settings are missing.");
  }
  const signOptions: SignOptions = {
    expiresIn: refreshTokenExpiresIn as SignOptions["expiresIn"],
    algorithm: "HS256",
  };
  return jwt.sign({ ...payload }, refreshTokenSecret, signOptions);
};

export const verifyAccessToken = async (token: string) => {
  if (!accessTokenSecret) {
    console.error("JWT access secret is not defined in environment variables.");
    throw new Error("Server configuration error: JWT settings are missing.");
  }
  try {
    const decode = jwt.verify(token, accessTokenSecret);
    // console.log(decode);
    return decode;
  } catch (error) {
    // console.error("Failed to verify access token:", error);
    return null;
  }
};

export const verifyRefreshToken = async (token: string) => {
  if (!refreshTokenSecret) {
    console.error(
      "JWT refresh secret is not defined in environment variables."
    );
    throw new Error("Server configuration error: JWT settings are missing.");
  }
  try {
    return jwt.verify(token, refreshTokenSecret);
  } catch (error) {
    // console.error("Failed to verify refresh token:", error);
    return null;
  }
};

const createTokens = (payload: {
  userId: number;
  email: string;
  permissions: string[];
  role: string;
  organizationId: number;
  permissions_updated_at: number;
}) => {
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);
  return { accessToken, refreshToken };
};
export default createTokens;
