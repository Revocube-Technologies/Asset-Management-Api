import { Router } from "express";
import {
  adminForgotPassword,
  adminLogout,
  adminResetPassword,
  adminUpdatePassword,
  getCurrentAdmin,
  loginAdmin,
} from "root/src/controllers/authController";
import protectRoute from "root/src/middlewares/authMiddleware";

import validateRequestParameters from "root/src/validation";
import {
  adminForgotPasswordSchema,
  adminLoginSchema,
  adminUpdatePasswordSchema,
  createAdminSchema,
} from "root/src/validation/authValidation";
import { createAdmin } from "../../controllers/admin/adminManagementController";

const authRouter = Router();

authRouter.post(
  "/create",
  validateRequestParameters(createAdminSchema, "body"),
  createAdmin
);

authRouter.post(
  "/login",
  validateRequestParameters(adminLoginSchema, "body"),
  loginAdmin
);

authRouter.post(
  "/forgot-password",
  validateRequestParameters(adminForgotPasswordSchema, "body"),
  adminForgotPassword
);

authRouter.patch("/reset-password/:token", adminResetPassword);

authRouter.patch(
  "/update-password/:id",
  protectRoute("admin"),
  validateRequestParameters(adminUpdatePasswordSchema, "body"),
  adminUpdatePassword
);

authRouter.post("/logout", protectRoute("admin"), adminLogout);

authRouter.get("/get-current-admin", protectRoute("admin"), getCurrentAdmin);

export default authRouter;
