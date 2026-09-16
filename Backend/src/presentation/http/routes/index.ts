import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { AuthController } from "../controllers/AuthController";
import { CmsController } from "../controllers/CmsController";
import { RecruitmentController } from "../controllers/RecruitmentController";
import { KegiatanController } from "../controllers/KegiatanController";
import { AttendanceController } from "../controllers/AttendanceController";
import { UploadController } from "../controllers/UploadController";
import { MemberController } from "../controllers/MemberController";
import { DivisionController } from "../controllers/DivisionController";
import { DashboardController } from "../controllers/DashboardController";
import { KasController } from "../controllers/KasController";
import { InterviewController } from "../controllers/InterviewController";
import { FaqController } from "../controllers/FaqController";
import { createUserRoutes } from "./userRoutes";
import { createAuthRoutes } from "./authRoutes";
import { createCmsRoutes } from "./cmsRoutes";
import { createRecruitmentRoutes } from "./recruitmentRoutes";
import { createKegiatanRoutes } from "./kegiatanRoutes";
import { createAttendanceRoutes } from "./attendanceRoutes";
import { createUploadRoutes } from "./uploadRoutes";
import { createMemberRoutes } from "./memberRoutes";
import { createDivisionRoutes } from "./divisionRoutes";
import { createDashboardRoutes } from "./dashboard.routes";
import { createKasRoutes } from "./kasRoutes";
import { createInterviewRoutes } from "./interviewRoutes";
import { createFaqRoutes } from "./faqRoutes";

export interface AppControllers {
  dashboardController: DashboardController;
  userController: UserController;
  authController: AuthController;
  cmsController: CmsController;
  recruitmentController: RecruitmentController;
  kegiatanController: KegiatanController;
  attendanceController: AttendanceController;
  uploadController: UploadController;
  memberController: MemberController;
  divisionController: DivisionController;
  kasController: KasController;
  interviewController: InterviewController;
  faqController: FaqController;
}

export function createApiRouter(controllers: AppControllers): Router {
  const router = Router();

  router.use("/auth", createAuthRoutes(controllers.authController));
  router.use("/cms", createCmsRoutes(controllers.cmsController));
  router.use("/recruitment", createRecruitmentRoutes(controllers.recruitmentController));
  router.use("/kegiatan", createKegiatanRoutes(controllers.kegiatanController));
  router.use("/attendance", createAttendanceRoutes(controllers.attendanceController));
  router.use("/users", createUserRoutes(controllers.userController));
  router.use("/upload", createUploadRoutes(controllers.uploadController));
  router.use("/divisions", createDivisionRoutes(controllers.divisionController));
  router.use("/members", createMemberRoutes(controllers.memberController));
  router.use("/dashboard", createDashboardRoutes(controllers.dashboardController));
  router.use("/kas", createKasRoutes(controllers.kasController));
  router.use("/wawancara", createInterviewRoutes(controllers.interviewController));
  router.use("/faqs", createFaqRoutes(controllers.faqController));


  // Health Check
  router.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

