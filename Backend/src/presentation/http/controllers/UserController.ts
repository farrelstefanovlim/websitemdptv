import { Request, Response, NextFunction } from "express";
import { RegisterUserUseCase } from "@application/use-cases/RegisterUserUseCase";
import { GetAllUsersUseCase } from "@application/use-cases/GetAllUsersUseCase";

export class UserController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase
  ) {}

  public register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const response = await this.registerUserUseCase.execute(req.body);
      
      res.status(201).json({
        success: true,
        message: "User berhasil didaftarkan.",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const response = await this.getAllUsersUseCase.execute();
      
      res.status(200).json({
        success: true,
        message: "Berhasil mengambil semua data user.",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };
}
