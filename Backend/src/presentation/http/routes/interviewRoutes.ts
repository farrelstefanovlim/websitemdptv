import { Router } from "express";
import { InterviewController } from "../controllers/InterviewController";

export function createInterviewRoutes(interviewController: InterviewController): Router {
  const router = Router();

  // Route Periode Tahun
  router.get("/years", interviewController.getYears.bind(interviewController));
  router.post("/years", interviewController.createYear.bind(interviewController));
  router.delete("/years/:year", interviewController.deleteYear.bind(interviewController));

  // Route Pertanyaan
  router.get("/questions", interviewController.getQuestions.bind(interviewController));
  router.post("/questions", interviewController.createQuestion.bind(interviewController));
  router.put("/questions/:id", interviewController.updateQuestion.bind(interviewController));
  router.delete("/questions/:id", interviewController.deleteQuestion.bind(interviewController));

  // Route Log Jawaban Wawancara
  router.get("/responses", interviewController.getResponses.bind(interviewController));
  router.post("/responses", interviewController.submitResponse.bind(interviewController));
  router.delete("/responses/:id", interviewController.deleteResponse.bind(interviewController));

  return router;
}
