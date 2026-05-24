import { Router } from "express";
import { DivisionController } from "../controllers/DivisionController";

export function createDivisionRoutes(divisionController: DivisionController): Router {
  const router = Router();
  router.get("/", divisionController.getAll.bind(divisionController));
  return router;
}
