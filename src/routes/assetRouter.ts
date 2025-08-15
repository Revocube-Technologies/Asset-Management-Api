import { Router } from "express";
import {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  changeAssetStatus,
  deleteAsset,
  getAssetLogs,
} from "root/src/controllers/assetController";
import { protectRoute } from "root/src/middlewares/authMiddleware";
import validateRequestParameters from "root/src/validation";
import {
  createAssetValidator,
  getAllAssetsValidator,
  getAssetByIdValidator,
  updateAssetValidator,
  changeAssetStatusValidator,
} from "root/src/validation/assetValidator";

const assetRouter = Router();

assetRouter.post(
  "/create",
  validateRequestParameters(createAssetValidator, "body"),
  createAsset
);

assetRouter.get(
  "/assets",
  validateRequestParameters(getAllAssetsValidator, "body"),
  getAllAssets
);

assetRouter.get(
  "/asset/:id",
  validateRequestParameters(getAssetByIdValidator, "body"),
  getAssetById
);

assetRouter.patch(
  "/update-asset",
  protectRoute,
  validateRequestParameters(updateAssetValidator, "body"),
  updateAsset
);

assetRouter.patch(
  "/change-status",
  protectRoute,
  validateRequestParameters(changeAssetStatusValidator, "body"),
  changeAssetStatus
);

assetRouter.delete(
  "/delete-asset/:id",
  protectRoute,
  validateRequestParameters(getAssetByIdValidator, "body"),
  deleteAsset
);

assetRouter.get(
  "/asset-logs/:id",
  protectRoute,
  validateRequestParameters(getAssetByIdValidator, "body"),
  getAssetLogs
);

export default assetRouter;
