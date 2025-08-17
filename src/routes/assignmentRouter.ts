import { Router } from "express";
import {
  createAssignment,
  returnAsset,
  getAllAssignments,
  getAssignmentById
} from "root/src/controllers/assignmentController";
import { protectRoute } from "root/src/middlewares/authMiddleware";
import validateRequestParameters from "root/src/validation";
import {
  createAssignmentValidator,
  getAllAssignmentsValidator,
  getAssignmentByIdValidator,
} from "root/src/validation/assignmentValidator";

const assignmentRouter = Router();

assignmentRouter.post(
  "/create",
  validateRequestParameters(createAssignmentValidator, "body"),
  createAssignment
);

assignmentRouter.get(
  "/assignments",
  validateRequestParameters(getAllAssignmentsValidator, "body"),
  getAllAssignments
);

assignmentRouter.get(
  "/assignment/:id",
  validateRequestParameters(getAssignmentByIdValidator, "body"),
  getAssignmentById
);

assignmentRouter.patch(
  "/return-asset",
  protectRoute,
  validateRequestParameters(getAssignmentByIdValidator, "body"),
  returnAsset
);

export default assignmentRouter;