import { Router } from "express";
import {
  createRole,
  updateRole,
  getRoles,
  deleteRole,
  getAllPermissions,
} from "root/src/controllers/roleController";
import protectRoute from "root/src/middlewares/authMiddleware";
import validateRequestParameters from "root/src/validation";
import {
  createRoleValidator,
  updateRoleValidator,
} from "root/src/validation/roleValidator";

const roleRouter = Router();

roleRouter.post(
  "/create",
  protectRoute("admin"),
  validateRequestParameters(createRoleValidator, "body"),
  createRole
);
roleRouter.patch(
  "/update/:id",
  protectRoute("admin"),
  validateRequestParameters(updateRoleValidator, "body"),
  updateRole
);
roleRouter.delete("/delete/:id", protectRoute("admin"), deleteRole);
roleRouter.get("/get-role/", protectRoute("admin"), getRoles);

roleRouter.get("/get-permissions", protectRoute("admin"), getAllPermissions);

export default roleRouter;
