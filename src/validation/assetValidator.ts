import * as Yup from 'yup';
import { purchaseStatus, AssetStatus } from "@prisma/client";

export const createAssetValidator = Yup.object().shape({
  name: Yup.string().required("Asset name is required"),
  type: Yup.string().required("Asset type is required"),
  price: Yup.number().required("Asset price is required"),
  purchaseDate: Yup.date().required("Asset purchase date is required"),
  warrantyExpiry: Yup.date().nullable(),
  locationId: Yup.string().required("Asset location is required"),
  notes: Yup.string().nullable(),
  purchaseType: Yup.string().oneOf(Object.values(purchaseStatus)).required("Asset purchase type is required"),
})

export const getAllAssetsValidator = Yup.object().shape({
  page: Yup.number().required("Page number is required"),
  perPage: Yup.number().required("Items per page is required"),
  status: Yup.string().required("Asset status is required"),
  type: Yup.string().required("Asset type is required"),
  locationId: Yup.string().required("Asset location is required"),
})

export const getAssetByIdValidator = Yup.object().shape({
  id: Yup.string().uuid().required("ID is required").uuid("Invalid ID format"),
});

export const updateAssetValidator = Yup.object().shape({
  name: Yup.string(),
  type: Yup.string(),
  price: Yup.number(),
  purchaseDate: Yup.date(),
  warrantyExpiry: Yup.date().nullable(),
  locationId: Yup.string(),
  notes: Yup.string().nullable(),
  purchaseType: Yup.string().oneOf(Object.values(purchaseStatus)),
});

export const changeAssetStatusValidator = Yup.object().shape({
  status: Yup.string().oneOf(Object.values(AssetStatus)).required("Asset status is required"),
});

export type TCreateAssetType = Yup.InferType<typeof createAssetValidator>
export type TGetAllAssetsType = Yup.InferType<typeof getAllAssetsValidator>
export type TGetAssetByIdType = Yup.InferType<typeof getAssetByIdValidator>
export type TUpdateAssetType = Yup.InferType<typeof updateAssetValidator>
export type TChangeAssetStatusType = Yup.InferType<typeof changeAssetStatusValidator> 


