import { Router } from "express";
import {
  logRepair,
  completeRepair,
  getRepairs,
  getRepairById,
  createGeneralMaintenance,
} from "root/src/controllers/repairController";
import { protectRoute } from "root/src/middlewares/authMiddleware";
import validateRequestParameters from "root/src/validation";
import {
  logRepairValidator,
  completeRepairValidator,
  getRepairsValidator,
  getRepairByIdValidator,
  generalMaintenanceValidator,
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
  "/all-repairs",
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

repairRouter.post(
  "/general",
  protectRoute,
  validateRequestParameters(generalMaintenanceValidator, "body"),
  createGeneralMaintenance
);


export default repairRouter;
