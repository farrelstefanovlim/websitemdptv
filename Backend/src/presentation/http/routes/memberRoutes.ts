import { Router } from "express";
import { MemberController } from "../controllers/MemberController";

export function createMemberRoutes(memberController: MemberController): Router {
  const router = Router();

  router.get("/", memberController.getAll.bind(memberController));
  router.post("/", memberController.create.bind(memberController));
  router.patch("/:id", memberController.update.bind(memberController));
  router.delete("/:id", memberController.delete.bind(memberController));
  router.patch("/:id/feature", memberController.toggleActive.bind(memberController));

  return router;
}
