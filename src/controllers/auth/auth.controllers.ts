import prisma from "../../utils/prisma.ts";
import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";

import createTokens from "../../utils/jwt.ts";

export const login = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { [role]: true },
    });

    if (!user || !user[role]) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const tokens = createTokens({ id: user.id, email: user.email });
    const { password: _, ...safeUserData } = user;
    const tokenObj = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: safeUserData,
    };

    return res.status(200).json({ message: "Login Successful", tokenObj });
  } catch (e) {
    return res.status(500).json({ message: "Somthing Went Wrong" });
  }
};
