import { Router } from "express";
import {
  logRepair,
  completeRepair,
  getRepairs,
  getRepairById,
} from "root/src/controllers/repairController";
import { protectRoute } from "root/src/middlewares/authMiddleware";
import validateRequestParameters from "root/src/validation";
import {
  logRepairValidator,
  completeRepairValidator,
  getRepairsValidator,
  getRepairByIdValidator,
} from "root/src/validation/repairValidator";

const repairRouter = Router();

repairRouter.post(
  "/log-repair/:id",
  protectRoute,
  validateRequestParameters(logRepairValidator, "body"),
  logRepair
);

repairRouter.patch(
  "/complete-repair/:id",
  protectRoute,
  validateRequestParameters(completeRepairValidator, "body"),
  completeRepair
);

repairRouter.get(
  "/repairs",
  protectRoute,
  validateRequestParameters(getRepairsValidator, "query"),
  getRepairs
);

repairRouter.get(
  "/repair/:id",
  protectRoute,
  validateRequestParameters(getRepairByIdValidator, "params"),
  getRepairById
);

export default repairRouter;