import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@infrastructure/config/env";
import prisma from "@infrastructure/database/prismaClient";
import { BunHashService } from "@infrastructure/services/BunHashService";

const hashService = new BunHashService();

export class AuthController {
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ status: "error", message: "Email dan password wajib diisi." });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.is_active) {
        res.status(401).json({ status: "error", message: "Email atau password salah." });
        return;
      }

      const isMatch = await hashService.compare(password, user.password_hash);
      if (!isMatch) {
        res.status(401).json({ status: "error", message: "Email atau password salah." });
        return;
      }

      // Generate Access Token (15 menit)
      const accessToken = jwt.sign(
        { id: user.id, role: user.role, username: user.username },
        env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      // Generate Refresh Token (7 hari)
      const refreshToken = jwt.sign(
        { id: user.id },
        env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      // Update last_login
      await prisma.user.update({ where: { id: user.id }, data: { last_login: new Date() } });

      // Set Refresh Token sebagai HttpOnly Cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
      });

      res.status(200).json({
        status: "success",
        data: {
          accessToken,
          user: { id: user.id, username: user.username, role: user.role }
        },
        message: "Login berhasil."
      });
    } catch (error) {
      next(error);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) {
        res.status(401).json({ status: "error", message: "Refresh token tidak ditemukan." });
        return;
      }

      const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };

      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (!user || !user.is_active) {
        res.status(401).json({ status: "error", message: "User tidak ditemukan atau nonaktif." });
        return;
      }

      const accessToken = jwt.sign(
        { id: user.id, role: user.role, username: user.username },
        env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.status(200).json({ status: "success", data: { accessToken } });
    } catch (error) {
      res.status(401).json({ status: "error", message: "Refresh token tidak valid." });
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.status(200).json({ status: "success", message: "Logout berhasil." });
    } catch (error) {
      next(error);
    }
  };
}
