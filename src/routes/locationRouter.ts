import { Router } from "express";
import {
  createLocation,
  getLocation,
  updateLocation,
  deleteLocation,
  getAllLocations,
} from "root/src/controllers/locationController";
import { protectRoute } from "root/src/middlewares/authMiddleware";
import validateRequestParameters from "root/src/validation";
import {
  createLocationValidator,
  getAllLocationsValidator,
  updateLocationValidator,
} from "root/src/validation/locationValidator";

const locationRouter = Router();

locationRouter.post(
  "/create-location",
  protectRoute,
  validateRequestParameters(createLocationValidator, "body"),
  createLocation
);

locationRouter.patch(
  "/update-location/:id",
  protectRoute,
  validateRequestParameters(updateLocationValidator, "body"),
  updateLocation
);

locationRouter.get(
  "/get-all-locations",
  protectRoute,
  validateRequestParameters(getAllLocationsValidator, "query"),
  getAllLocations
);

locationRouter.get("/get-location/:id", protectRoute, getLocation);

locationRouter.delete("/delete-location/:id", protectRoute, deleteLocation);

export default locationRouter;
