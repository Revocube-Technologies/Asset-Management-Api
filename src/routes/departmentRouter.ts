import { Router } from "express";
import {
  createDepartment,
  getDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} from "root/src/controllers/departmentController";
import { protectRoute } from "root/src/middlewares/authMiddleware";
import validateRequestParameters from "root/src/validation";
import {
  createDepartmentValidator,
  getDepartmentValidator,
  updateDepartmentValidator,
  getAllDepartmentsValidator,
} from "root/src/validation/departmentValidator";

const departmentRouter = Router();

departmentRouter.post(
  "/create",
  protectRoute,
  validateRequestParameters(createDepartmentValidator, "body"),
  createDepartment
);

departmentRouter.get(
  "/get-department/:id",
  protectRoute,
  validateRequestParameters(getDepartmentValidator, "params"),
  getDepartment
);

departmentRouter.get(
  "/get-all-departments",
  protectRoute,
  validateRequestParameters(getAllDepartmentsValidator, "query"),
  getAllDepartments
);

departmentRouter.patch(
  "/update-department/:id",
  protectRoute,
  validateRequestParameters(updateDepartmentValidator, "body"),
  updateDepartment
);

departmentRouter.delete(
  "/delete-department/:id",
  protectRoute,
  deleteDepartment
);

export default departmentRouter;
