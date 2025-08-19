import { Router } from "express";
import {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  changeAssetStatus,
  deleteAsset,
  getAssetLogs,
  getAllAssetsLogs,
} from "root/src/controllers/assetController";
import { protectRoute } from "root/src/middlewares/authMiddleware";
import validateRequestParameters from "root/src/validation";
import {
  createAssetValidator,
  getAllAssetsValidator,
  getAssetByIdValidator,
  updateAssetValidator,
  changeAssetStatusValidator,
  getAllAssetsLogsValidator,
} from "root/src/validation/assetValidator";
import { upload } from "root/src/config/uploadFiles";

const assetRouter = Router();

assetRouter.patch(
  "/change-status/:id",
  protectRoute,
  validateRequestParameters(changeAssetStatusValidator, "body"),
  changeAssetStatus
);

assetRouter.post(
  "/create",
  protectRoute,
  upload.single("imageFile"),
  validateRequestParameters(createAssetValidator, "body"),
  createAsset
);

assetRouter.get(
  "/all-assets",
  validateRequestParameters(getAllAssetsValidator, "query"),
  getAllAssets
);

assetRouter.get(
  "/asset/:id",
  validateRequestParameters(getAssetByIdValidator, "params"),
  getAssetById
);

assetRouter.patch(
  "/update-asset/:id",
  protectRoute,
  upload.single("imageFile"),
  validateRequestParameters(updateAssetValidator, "body"),
  updateAsset
);

assetRouter.delete("/delete-asset/:id", protectRoute, deleteAsset);

assetRouter.get(
  "/asset-logs/:id",
  protectRoute,
  validateRequestParameters(getAssetByIdValidator, "params"),
  getAssetLogs
);

assetRouter.get("/get-all-logs", protectRoute, validateRequestParameters(getAllAssetsLogsValidator, "params"), getAllAssetsLogs);

export default assetRouter;
