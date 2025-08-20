import { Router } from "express";
import {
  createAssignment,
  returnAsset,
  getAllAssignments,
  getAssignmentById,
} from "root/src/controllers/assignmentController";
import { protectRoute } from "root/src/middlewares/authMiddleware";
import validateRequestParameters from "root/src/validation";
import {
  createAssignmentValidator,
  getAllAssignmentsValidator,
  returnAssetValidator,
} from "root/src/validation/assignmentValidator";

const assignmentRouter = Router();

assignmentRouter.post(
  "/create",
  protectRoute,
  validateRequestParameters(createAssignmentValidator, "body"),
  createAssignment
);

assignmentRouter.patch(
  "/return-asset",
  protectRoute,
  validateRequestParameters(returnAssetValidator, "body"),
  returnAsset
);

assignmentRouter.get(
  "/all-assignments",
  protectRoute,
  validateRequestParameters(getAllAssignmentsValidator, "query"),
  getAllAssignments
);

assignmentRouter.get("/assignment/:id", protectRoute, getAssignmentById);

export default assignmentRouter;
