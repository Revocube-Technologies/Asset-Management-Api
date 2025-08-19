import { Router } from "express";
import {
  createRequest,
  updateRequestStatus,
  getAllRequests,
  getRequestById,
} from "root/src/controllers/requestController";
import { protectRoute } from "root/src/middlewares/authMiddleware";
import validateRequestParameters from "root/src/validation";
import {
  createRequestValidator,
  getAllRequestsValidator,
  getRequestByIdValidator,
  updateRequestStatusValidator,
} from "root/src/validation/requestValidator";

const requestRouter = Router();

requestRouter.post(
  "/create",
  protectRoute,
  validateRequestParameters(createRequestValidator, "body"),
  createRequest
);

requestRouter.patch(
  "/update-request-status/:id",
  protectRoute,
  validateRequestParameters(updateRequestStatusValidator, "body"),
  updateRequestStatus
);

requestRouter.get(
  "/requests",
  protectRoute,
  validateRequestParameters(getAllRequestsValidator, "query"),
  getAllRequests
);

requestRouter.get(
  "/request/:id",
  protectRoute,
  validateRequestParameters(getRequestByIdValidator, "params"),
  getRequestById
);

export default requestRouter;
