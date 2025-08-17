import { Router } from "express";
import {
  createLocation,
  getLocation,
  updateLocation,
  deleteLocation,
} from "root/src/controllers/locationController";
import { protectRoute } from "root/src/middlewares/authMiddleware";
import validateRequestParameters from "root/src/validation";
import {
  createLocationValidator,
  getDepartmentValidator,
  getAllLocationValidator,
  updatelocationValidator,
} from "root/src/validation/locationValidator";
import validateRequestParameters from "root/src/validation";

const locationRouter = Router();

locationRouter.post(
  "/create-location",
  protectRoute,
  validateRequestParameters(createLocationValidator, "body"),
  createLocation
);

locationRouter.patch(
  "/update-location",
  protectRoute,
  validateRequestParameters(updatelocationValidator, "body"),
  updateLocation
);

locationRouter.get("/get-location", protectRoute, getLocation);

locationRouter.delete("/delete-location", protectRoute, deleteLocation);
