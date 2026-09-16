import { Router } from "express";
import { FaqController } from "../controllers/FaqController";

export function createFaqRoutes(faqController: FaqController): Router {
  const router = Router();

  router.get("/", faqController.getAll.bind(faqController));
  router.post("/", faqController.create.bind(faqController));
  router.put("/:id", faqController.update.bind(faqController));
  router.delete("/:id", faqController.delete.bind(faqController));

  return router;
}
