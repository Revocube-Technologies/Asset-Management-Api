import { Router } from "express";
import {
  createRole,
  updateRole,
  getRoles,
  deleteRole,
  getAllPermissions,
} from "root/src/controllers/roleController";
import { protectRoute } from "root/src/middlewares/authMiddleware";
import validateRequestParameters from "root/src/validation";
import {
  createRoleValidator,
  updateRoleValidator,
} from "root/src/validation/roleValidator";

const roleRouter = Router();

roleRouter.post(
  "/create",
  protectRoute,
  validateRequestParameters(createRoleValidator, "body"),
  createRole
);
roleRouter.patch(
  "/update/:id",
  protectRoute,
  validateRequestParameters(updateRoleValidator, "body"),
  updateRole
);
roleRouter.delete("/delete/:id", protectRoute, deleteRole);
roleRouter.get("/get-role/", protectRoute, getRoles);

roleRouter.get("/get-permissions", protectRoute, getAllPermissions);

export default roleRouter;
