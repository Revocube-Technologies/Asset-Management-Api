import { RepairStatus } from "@prisma/client";
import * as Yup from "yup";

export const logRepairValidator = Yup.object().shape({
  description: Yup.string().required("Description is required"),
  repairCost: Yup.number().required("Repair cost is required"),
  repairedBy: Yup.string().required("Repaired by is required"),
  requestLogId: Yup.string()
    .uuid()
    .required("Request ID is required")
    .uuid("Invalid Request ID format"),
});

export const completeRepairValidator = Yup.object().shape({
  remarks: Yup.string().nullable(),
});

export const getRepairByIdValidator = Yup.object().shape({
  id: Yup.string()
    .uuid()
    .required("Repair ID is required")
    .uuid("Invalid Repair ID format"),
});

export const getRepairsValidator = Yup.object().shape({
  page: Yup.number().positive("Page number must be positive").default(1),
  perPage: Yup.number().positive("Items per page must be positive").default(15),
  status: Yup.mixed<RepairStatus>()
    .optional()
    .oneOf(Object.values(RepairStatus), "Invalid repair status"),
});

export const generalMaintenanceValidator = Yup.object().shape({
  description: Yup.string().required("Description is required"),
  repairedBy: Yup.string().required("RepairedBy is required"),
  repairCost: Yup.number()
    .positive("Repair cost must be a positive number")
    .required("Repair cost is required"),
  assetIds: Yup.array()
    .of(
      Yup.string()
        .trim()
        .required("Each assetId must be a valid string")
    )
    .min(1, "At least one assetId is required")
    .required("AssetIds are required"),
});


export type TLogRepairType = Yup.InferType<typeof logRepairValidator>;
export type TCompleteRepairType = Yup.InferType<typeof completeRepairValidator>;
export type TGetRepairsType = Yup.InferType<typeof getRepairsValidator>;
export type TGetRepairByIdType = Yup.InferType<typeof getRepairByIdValidator>;
export type TGeneralMaintenanceType = Yup.InferType<
  typeof generalMaintenanceValidator>;
