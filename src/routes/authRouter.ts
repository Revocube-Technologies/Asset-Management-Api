import { Router } from "express";
import {
  createAdmin,
  updateAdmin,
  loginAdmin,
  adminForgotPassword,
  adminResetPassword,
  adminUpdatePassword,
  getAllAdmins,
  getAdminById,
  suspendAdmin,
  adminLogout,
} from "root/src/controllers/authController";
import { protectRoute } from "root/src/middlewares/authMiddleware";

import validateRequestParameters from "root/src/validation";
import {
  forgotPasswordValidator,
  adminLoginValidator,
  adminUpdatePasswordValidator,
  createAdminValidator,
  resetPasswordValidator,
  getAllAdminsValidator,
} from "root/src/validation/authValidator";

const authRouter = Router();

authRouter.post(
  "/create",
  validateRequestParameters(createAdminValidator, "body"),
  createAdmin
);

authRouter.post(
  "/login",
  validateRequestParameters(adminLoginValidator, "body"),
  loginAdmin
);

authRouter.post(
  "/forgot-password",
  validateRequestParameters(forgotPasswordValidator, "body"),
  adminForgotPassword
);

authRouter.patch("/reset-password/:token", validateRequestParameters(resetPasswordValidator, "body"), adminResetPassword);

authRouter.patch(
  "/update-password/:id",
  protectRoute,
  validateRequestParameters(adminUpdatePasswordValidator, "body"),
  adminUpdatePassword
);

authRouter.patch(
  "/update/:id",
  protectRoute, updateAdmin
);

authRouter.post(
  "/suspend/:id",
  protectRoute,
  suspendAdmin
);

authRouter.get("/get-all-admins", protectRoute, getAllAdmins);

authRouter.get(
  "/get-admin/:id",
  protectRoute,
  validateRequestParameters(getAllAdminsValidator, "params"),
  getAdminById
);

authRouter.post("/logout", protectRoute, adminLogout);

export default authRouter;
