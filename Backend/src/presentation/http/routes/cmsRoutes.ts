import { Router } from "express";
import { CmsController } from "../controllers/CmsController";
import { authMiddleware } from "../middlewares/authMiddleware";

export function createCmsRoutes(cmsController: CmsController): Router {
  const router = Router();

  // Public
  router.get("/sections", cmsController.getSections);
  router.get("/gallery", cmsController.getGallery);

  // Protected (Superadmin only)
  router.post("/gallery", authMiddleware, cmsController.addGallery);
  router.delete("/gallery/:id", authMiddleware, cmsController.deleteGallery);
  router.patch("/gallery/:id/feature", authMiddleware, cmsController.toggleGalleryFeatured);
  
  router.patch("/sections/layouts", authMiddleware, cmsController.updateLayouts);
  router.put("/sections/:key", authMiddleware, cmsController.updateSection);

  return router;
}
